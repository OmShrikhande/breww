const express = require('express');
const pool = require('../config/database');
const { ok, err } = require('../helpers/response');
const { authenticatePlayer, optionalAuth } = require('../middleware/auth');
const { engineFetch } = require('../helpers/engine');

const router = express.Router();

const ROULETTE_PAYOUTS = {
  straight: 35,
  red: 1,
  black: 1,
  odd: 1,
  even: 1,
  low: 1,
  high: 1,
};

const RED_NUMBERS = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);

const settleLocalRoulette = (bets = []) => {
  const winningNumber = Math.floor(Math.random() * 37);
  let payout = 0;
  const settled = bets.map((bet) => {
    const amount = Number(bet.amount) || 0;
    const type = bet.type || bet.betType || 'straight';
    const value = bet.value ?? bet.number ?? bet.selection;
    let won = false;

    if (type === 'straight' || type === 'number') {
      won = Number(value) === winningNumber;
    } else if (type === 'red') {
      won = winningNumber !== 0 && RED_NUMBERS.has(winningNumber);
    } else if (type === 'black') {
      won = winningNumber !== 0 && !RED_NUMBERS.has(winningNumber);
    } else if (type === 'odd') {
      won = winningNumber !== 0 && winningNumber % 2 === 1;
    } else if (type === 'even') {
      won = winningNumber !== 0 && winningNumber % 2 === 0;
    } else if (type === 'low') {
      won = winningNumber >= 1 && winningNumber <= 18;
    } else if (type === 'high') {
      won = winningNumber >= 19 && winningNumber <= 36;
    }

    const mult = ROULETTE_PAYOUTS[type] ?? ROULETTE_PAYOUTS.straight;
    const winAmount = won ? amount * (mult + 1) : 0;
    payout += winAmount;
    return { ...bet, won, winAmount };
  });

  return { winningNumber, payout, settled, roundId: `local-${Date.now()}` };
};

async function applyWalletDelta(client, userId, amount, type, note, refId) {
  const locked = await client.query('SELECT balance FROM users WHERE id = $1 FOR UPDATE', [userId]);
  const current = Number(locked.rows[0].balance);
  const next = current + amount;
  if (next < 0) {
    const error = new Error('Insufficient balance');
    error.status = 400;
    throw error;
  }
  await client.query(
    `UPDATE users SET balance = $1,
      total_bets = total_bets + CASE WHEN $2 < 0 THEN 1 ELSE 0 END,
      total_win = total_win + CASE WHEN $2 > 0 THEN $2 ELSE 0 END,
      total_loss = total_loss + CASE WHEN $2 < 0 THEN ABS($2) ELSE 0 END,
      updated_at = NOW()
     WHERE id = $3`,
    [next, amount, userId]
  );
  await client.query(
    `INSERT INTO user_balance_ledger (user_id, type, amount, balance_after, ref_id, note)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [userId, type, amount, next, refId || null, note || null]
  );
  return next;
}

router.get('/history', authenticatePlayer, async (req, res) => {
  try {
    const gameId = req.query.gameId || null;
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const params = [req.user.id];
    let sql = `SELECT id, game_id AS "gameId", amount, payout, result, status, created_at AS "createdAt", bet_payload AS "betPayload"
               FROM game_bets WHERE user_id = $1`;
    if (gameId) {
      params.push(gameId);
      sql += ` AND game_id = $2`;
    }
    params.push(limit);
    sql += ` ORDER BY created_at DESC LIMIT $${params.length}`;
    const result = await pool.query(sql, params);
    return ok(res, result.rows);
  } catch (e) {
    return err(res, 'Failed to load history', 500);
  }
});

router.post('/bet', authenticatePlayer, async (req, res) => {
  const client = await pool.connect();
  try {
    const gameId = req.body?.gameId || req.body?.game || 'unknown';
    const amount = Number(req.body?.amount);
    const betPayload = req.body?.betData || req.body?.bets || req.body || {};
    if (!Number.isFinite(amount) || amount <= 0) return err(res, 'Invalid bet amount');

    await client.query('BEGIN');
    const balanceAfterBet = await applyWalletDelta(client, req.user.id, -amount, 'bet', `${gameId} bet`, gameId);

    let engineResult = null;
    try {
      engineResult = await engineFetch('/bets', {
        method: 'POST',
        body: { userId: req.user.id, gameId, amount, bet: betPayload },
      });
    } catch {
      engineResult = null;
    }

    const payout = Number(engineResult?.payout ?? engineResult?.data?.payout ?? 0);
    let balance = balanceAfterBet;
    if (payout > 0) {
      balance = await applyWalletDelta(client, req.user.id, payout, 'win', `${gameId} win`, gameId);
    }

    const inserted = await client.query(
      `INSERT INTO game_bets (user_id, game_id, bet_payload, amount, payout, result, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'settled')
       RETURNING id, game_id AS "gameId", amount, payout, result, created_at AS "createdAt"`,
      [req.user.id, gameId, JSON.stringify(betPayload), amount, payout, engineResult || { local: true }]
    );

    await client.query('COMMIT');
    return ok(res, {
      success: true,
      bet: inserted.rows[0],
      balance,
      engine: engineResult,
    });
  } catch (e) {
    await client.query('ROLLBACK');
    return err(res, e.message || 'Bet failed', e.status || 500);
  } finally {
    client.release();
  }
});

router.post('/roulette/bet', optionalAuth, async (req, res) => {
  const bets = req.body?.bets || [];
  if (!Array.isArray(bets) || bets.length === 0) return err(res, 'bets array required');

  const stake = bets.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
  if (stake <= 0) return err(res, 'Invalid total stake');

  // Prefer external engine when available
  try {
    const engineResult = await engineFetch('/roulette/bet', {
      method: 'POST',
      body: { bets, userId: req.user?.id },
    });
    if (engineResult) {
      return ok(res, engineResult.data || engineResult);
    }
  } catch (e) {
    // fall through to local settlement
    console.warn('Engine roulette unavailable, using local:', e.message);
  }

  const local = settleLocalRoulette(bets);

  if (!req.user) {
    return ok(res, {
      roundId: local.roundId,
      winningNumber: local.winningNumber,
      payout: local.payout,
      settled: local.settled,
      guest: true,
    });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await applyWalletDelta(client, req.user.id, -stake, 'bet', 'roulette bet', local.roundId);
    let balance = null;
    if (local.payout > 0) {
      balance = await applyWalletDelta(client, req.user.id, local.payout, 'win', 'roulette win', local.roundId);
    } else {
      const bal = await client.query('SELECT balance FROM users WHERE id = $1', [req.user.id]);
      balance = Number(bal.rows[0].balance);
    }

    await client.query(
      `INSERT INTO game_bets (user_id, game_id, bet_payload, amount, payout, result, status)
       VALUES ($1, 'roulette', $2, $3, $4, $5, 'settled')`,
      [req.user.id, JSON.stringify(bets), stake, local.payout, JSON.stringify(local)]
    );
    await client.query('COMMIT');

    return ok(res, {
      roundId: local.roundId,
      winningNumber: local.winningNumber,
      payout: local.payout,
      settled: local.settled,
      balance,
    });
  } catch (e) {
    await client.query('ROLLBACK');
    return err(res, e.message || 'Roulette bet failed', e.status || 500);
  } finally {
    client.release();
  }
});

module.exports = router;
