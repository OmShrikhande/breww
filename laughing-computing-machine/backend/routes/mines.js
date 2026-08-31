const express = require('express');
const pool = require('../config/database');
const { ok, err } = require('../helpers/response');
const { authenticatePlayer } = require('../middleware/auth');
const {
  GRID_SIZE,
  generateMinePositions,
  planMaxSafeReveals,
  calcMultiplier,
  nextMultiplier,
  effectiveMultiplier,
  resolveReveal,
  resolveCashout,
} = require('../helpers/minesEngine');
const { broadcastBalance } = require('../../services/websocketServer');

const router = express.Router();

async function walletDelta(client, userId, amount, type, note, refId) {
  const locked = await client.query('SELECT balance FROM users WHERE id = $1 FOR UPDATE', [userId]);
  const current = Number(locked.rows[0]?.balance || 0);
  const next = current + amount;
  if (next < 0) {
    const e = new Error('Insufficient balance');
    e.status = 400;
    throw e;
  }
  await client.query('UPDATE users SET balance = $1, updated_at = NOW() WHERE id = $2', [next, userId]);
  await client.query(
    `INSERT INTO user_balance_ledger (user_id, type, amount, balance_after, ref_id, note)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [userId, type, amount, next, refId || null, note || null]
  );
  return next;
}

function sessionView(row) {
  const revealed = row.revealed_tiles || [];
  const mineCount = row.mine_count;
  const betAmount = Number(row.bet_amount);
  const baseMult = calcMultiplier(mineCount, revealed.length);
  const mult = effectiveMultiplier(betAmount, mineCount, revealed.length, baseMult);
  return {
    sessionId: Number(row.id),
    status: row.status,
    betAmount,
    mineCount,
    revealedTiles: revealed,
    revealedCount: revealed.length,
    multiplier: mult,
    nextMultiplier: row.status === 'playing'
      ? nextMultiplier(mineCount, revealed.length, betAmount)
      : null,
    payout: row.payout != null ? Number(row.payout) : undefined,
  };
}

async function abandonStaleSessions(client, userId) {
  await client.query(
    `UPDATE mines_sessions SET status = 'lost', payout = 0, ended_at = NOW()
     WHERE user_id = $1 AND status = 'playing'
     AND (
       jsonb_array_length(COALESCE(revealed_tiles, '[]'::jsonb)) = 0
       OR created_at < NOW() - INTERVAL '2 hours'
     )`,
    [userId]
  );
}

router.get('/active', authenticatePlayer, async (req, res) => {
  try {
    await abandonStaleSessions(pool, req.user.id);
    const { rows } = await pool.query(
      `SELECT * FROM mines_sessions WHERE user_id = $1 AND status = 'playing' ORDER BY id DESC LIMIT 1`,
      [req.user.id]
    );
    if (!rows[0]) return ok(res, null);
    return ok(res, sessionView(rows[0]));
  } catch (e) {
    return err(res, e.message || 'Failed to load session', 500);
  }
});

router.post('/abandon', authenticatePlayer, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await abandonStaleSessions(client, req.user.id);
    const { rows } = await client.query(
      `SELECT * FROM mines_sessions WHERE user_id = $1 AND status = 'playing' ORDER BY id DESC LIMIT 1 FOR UPDATE`,
      [req.user.id]
    );
    if (!rows[0]) {
      await client.query('COMMIT');
      return ok(res, { abandoned: false });
    }
    const session = rows[0];
    await client.query(
      `UPDATE mines_sessions SET status = 'lost', payout = 0, ended_at = NOW() WHERE id = $1`,
      [session.id]
    );
    await client.query(
      `UPDATE game_bets SET status = 'settled', payout = 0, result = $1
       WHERE user_id = $2 AND game_id = 'mines' AND status = 'pending'
       AND (bet_payload->>'sessionId')::int = $3`,
      [JSON.stringify({ abandoned: true }), req.user.id, session.id]
    );
    await client.query('COMMIT');
    return ok(res, { abandoned: true, sessionId: Number(session.id) });
  } catch (e) {
    await client.query('ROLLBACK');
    return err(res, e.message || 'Could not abandon game', 500);
  } finally {
    client.release();
  }
});

router.post('/start', authenticatePlayer, async (req, res) => {
  const client = await pool.connect();
  try {
    const amount = Number(req.body?.amount ?? req.body?.betAmount);
    const mineCount = Number(req.body?.mineCount ?? 3);
    if (!Number.isFinite(amount) || amount < 10) return err(res, 'Minimum bet is ₹10');
    if (!Number.isInteger(mineCount) || mineCount < 1 || mineCount > 24) {
      return err(res, 'Mine count must be between 1 and 24');
    }

    await client.query('BEGIN');
    await abandonStaleSessions(client, req.user.id);

    const active = await client.query(
      `SELECT id FROM mines_sessions WHERE user_id = $1 AND status = 'playing' LIMIT 1`,
      [req.user.id]
    );
    if (active.rows[0]) {
      await client.query('ROLLBACK');
      return err(res, 'Finish your current game first (or tap Reset Game)', 400);
    }

    const balance = await walletDelta(client, req.user.id, -amount, 'bet', 'mines start', 'mines');
    const maxSafe = planMaxSafeReveals(amount, mineCount);
    const minePositions = generateMinePositions(mineCount);

    const { rows } = await client.query(
      `INSERT INTO mines_sessions (user_id, bet_amount, mine_count, mine_positions, revealed_tiles, max_safe_reveals, status)
       VALUES ($1, $2, $3, $4, '[]', $5, 'playing')
       RETURNING *`,
      [req.user.id, amount, mineCount, JSON.stringify(minePositions), maxSafe]
    );

    await client.query(
      `INSERT INTO game_bets (user_id, game_id, bet_payload, amount, payout, status)
       VALUES ($1, 'mines', $2, $3, 0, 'pending')`,
      [req.user.id, JSON.stringify({ sessionId: rows[0].id, mineCount }), amount]
    );

    await client.query('COMMIT');
    return ok(res, { ...sessionView(rows[0]), balance, gridSize: GRID_SIZE }, 201);
  } catch (e) {
    await client.query('ROLLBACK');
    return err(res, e.message || 'Could not start game', e.status || 500);
  } finally {
    client.release();
  }
});

router.post('/reveal', authenticatePlayer, async (req, res) => {
  const client = await pool.connect();
  try {
    const sessionId = Number(req.body?.sessionId);
    const tileIndex = Number(req.body?.tileIndex);
    if (!sessionId || !Number.isInteger(tileIndex) || tileIndex < 0 || tileIndex >= GRID_SIZE) {
      return err(res, 'Invalid tile');
    }

    await client.query('BEGIN');
    const { rows } = await client.query(
      `SELECT * FROM mines_sessions WHERE id = $1 AND user_id = $2 FOR UPDATE`,
      [sessionId, req.user.id]
    );
    if (!rows[0] || rows[0].status !== 'playing') {
      await client.query('ROLLBACK');
      return err(res, 'No active game', 400);
    }

    const session = rows[0];
    const revealed = session.revealed_tiles || [];
    if (revealed.includes(tileIndex)) {
      await client.query('ROLLBACK');
      return err(res, 'Tile already revealed', 400);
    }

    const outcome = resolveReveal(session, tileIndex);

    if (outcome.hitMine) {
      await client.query(
        `UPDATE mines_sessions SET revealed_tiles = $1, mine_positions = $2, status = 'lost', payout = 0, ended_at = NOW() WHERE id = $3`,
        [JSON.stringify(outcome.revealedTiles), JSON.stringify(outcome.newMineLayout), sessionId]
      );
      await client.query(
        `UPDATE game_bets SET status = 'settled', payout = 0, result = '{}'
         WHERE user_id = $1 AND game_id = 'mines' AND status = 'pending'
         AND (bet_payload->>'sessionId')::int = $2`,
        [req.user.id, sessionId]
      );
      const bal = await client.query('SELECT balance FROM users WHERE id = $1', [req.user.id]);
      await client.query('COMMIT');
      return ok(res, {
        hitMine: true,
        tileIndex,
        status: 'lost',
        minePositions: outcome.minePositions,
        revealedTiles: outcome.revealedTiles,
        balance: Number(bal.rows[0].balance),
      });
    }

    await client.query(
      `UPDATE mines_sessions SET revealed_tiles = $1, mine_positions = $2 WHERE id = $3`,
      [JSON.stringify(outcome.revealedTiles), JSON.stringify(outcome.newMineLayout), sessionId]
    );
    await client.query('COMMIT');

    return ok(res, {
      hitMine: false,
      tileIndex,
      status: 'playing',
      revealedTiles: outcome.revealedTiles,
      revealedCount: outcome.revealedCount,
      multiplier: outcome.multiplier,
      nextMultiplier: outcome.nextMultiplier,
    });
  } catch (e) {
    await client.query('ROLLBACK');
    return err(res, e.message || 'Reveal failed', e.status || 500);
  } finally {
    client.release();
  }
});

router.post('/cashout', authenticatePlayer, async (req, res) => {
  const client = await pool.connect();
  try {
    const sessionId = Number(req.body?.sessionId);
    if (!sessionId) return err(res, 'sessionId required');

    await client.query('BEGIN');
    const { rows } = await client.query(
      `SELECT * FROM mines_sessions WHERE id = $1 AND user_id = $2 FOR UPDATE`,
      [sessionId, req.user.id]
    );
    if (!rows[0] || rows[0].status !== 'playing') {
      await client.query('ROLLBACK');
      return err(res, 'No active game to cash out', 400);
    }

    const session = rows[0];
    const revealed = session.revealed_tiles || [];
    if (revealed.length === 0) {
      await client.query('ROLLBACK');
      return err(res, 'Reveal at least one safe tile first', 400);
    }

    const betAmount = Number(session.bet_amount);
    const mineCount = session.mine_count;
    const multiplier = calcMultiplier(mineCount, revealed.length);
    const payout = Math.floor(betAmount * multiplier * 100) / 100;

    const newBalance = await walletDelta(client, req.user.id, payout, 'win', 'mines cashout', 'mines');
    const minePositions = session.mine_positions || [];

    await client.query(
      `UPDATE mines_sessions SET status = 'won', payout = $1, ended_at = NOW() WHERE id = $2`,
      [payout, sessionId]
    );
    await client.query(
      `UPDATE game_bets SET status = 'settled', payout = $1, result = $2
       WHERE user_id = $3 AND game_id = 'mines' AND status = 'pending'
       AND (bet_payload->>'sessionId')::int = $4`,
      [payout, JSON.stringify({ payout, multiplier, revealedTiles: revealed }), req.user.id, sessionId]
    );
    await client.query('COMMIT');

    broadcastBalance(req.user.id, newBalance);

    return ok(res, {
      status: 'won',
      payout,
      multiplier,
      revealedTiles: revealed,
      minePositions,
      balance: newBalance,
    });
  } catch (e) {
    await client.query('ROLLBACK');
    return err(res, e.message || 'Cashout failed', e.status || 500);
  } finally {
    client.release();
  }
});

module.exports = router;
