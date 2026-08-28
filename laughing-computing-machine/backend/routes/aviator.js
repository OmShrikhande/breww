const express = require('express');
const pool = require('../config/database');
const { ok, err } = require('../helpers/response');
const { authenticatePlayer, optionalAuth } = require('../middleware/auth');
const {
  multiplierAtElapsed,
  normalizeCrashPoint,
  effectiveCashoutMultiplier,
  isValidCrash,
  MIN_CRASH,
} = require('../helpers/aviatorEngine');

const router = express.Router();
const GAME_ID = 'aviator';
const BET_WINDOW_SECONDS = 15;
const CRASH_DISPLAY_SECONDS = 3;

function maskUsername(name) {
  const s = String(name || 'player');
  if (s.length <= 2) return `${s[0]}***`;
  return `${s[0]}***${s[s.length - 1]}`;
}

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

async function getRecentWinners() {
  const { rows } = await pool.query(
    `SELECT u.username, ab.amount, ab.cashout_multiplier AS "cashoutMultiplier", ab.payout
     FROM aviator_bets ab
     JOIN users u ON u.id = ab.user_id
     WHERE ab.status = 'cashed_out'
       AND ab.round_id = (
         SELECT id FROM game_rounds
         WHERE game_id = $1 AND status = 'declared'
         ORDER BY declared_at DESC NULLS LAST LIMIT 1
       )
     ORDER BY ab.payout DESC
     LIMIT 15`,
    [GAME_ID]
  );
  return rows.map((r, i) => ({
    id: i,
    user: maskUsername(r.username),
    amount: Number(r.amount),
    cashoutMult: Number(r.cashoutMultiplier) || 1,
    payout: Number(r.payout) || 0,
    hasCashedOut: true,
  }));
}

async function getRoundBets(roundId, userId = null) {
  if (!roundId) return [];
  const { rows } = await pool.query(
    `SELECT u.username, ab.user_id, ab.amount, ab.status, ab.cashout_multiplier AS "cashoutMultiplier", ab.payout
     FROM aviator_bets ab
     JOIN users u ON u.id = ab.user_id
     WHERE ab.round_id = $1
     ORDER BY ab.created_at DESC
     LIMIT 50`,
    [roundId]
  );
  return rows.map((r, i) => ({
    id: i,
    user: maskUsername(r.username),
    amount: Number(r.amount),
    hasCashedOut: r.status === 'cashed_out',
    cashoutMult: Number(r.cashoutMultiplier) || 0,
    payout: Number(r.payout) || 0,
    isMe: userId ? Number(r.user_id) === Number(userId) : false,
  }));
}

async function getTopWinners() {
  const { rows } = await pool.query(
    `SELECT u.username, ab.amount, ab.cashout_multiplier AS "cashoutMultiplier", ab.payout
     FROM aviator_bets ab
     JOIN users u ON u.id = ab.user_id
     WHERE ab.status = 'cashed_out' AND ab.payout > 0
     ORDER BY ab.payout DESC
     LIMIT 20`,
    []
  );
  return rows.map((r, i) => ({
    id: `top-${i}`,
    user: maskUsername(r.username),
    amount: Number(r.amount),
    cashoutMult: Number(r.cashoutMultiplier) || 1,
    payout: Number(r.payout) || 0,
    hasCashedOut: true,
  }));
}

/** Shared room — betting (10s) → flying → brief crash display → next round */
async function getCurrentRound() {
  const crashed = await pool.query(
    `SELECT r.id AS "roundId", r.status, r.result, r.scheduled_result AS "scheduledResult",
            r.flying_started_at AS "flyingStartedAt", r.declared_at AS "declaredAt",
            0 AS "timerLeft", gs.min_bet AS "minBet", gs.max_bet AS "maxBet"
     FROM game_rounds r
     JOIN game_settings gs ON gs.game_id = r.game_id
     WHERE r.game_id = $1 AND r.status = 'declared'
       AND r.declared_at > NOW() - ($2 || ' seconds')::interval
     ORDER BY r.declared_at DESC NULLS LAST LIMIT 1`,
    [GAME_ID, CRASH_DISPLAY_SECONDS]
  );
  if (crashed.rows[0]) return { ...crashed.rows[0], phaseHint: 'crashed' };

  const flying = await pool.query(
    `SELECT r.id AS "roundId", r.status, r.result, r.scheduled_result AS "scheduledResult",
            r.flying_started_at AS "flyingStartedAt",
            0 AS "timerLeft", gs.min_bet AS "minBet", gs.max_bet AS "maxBet"
     FROM game_rounds r
     JOIN game_settings gs ON gs.game_id = r.game_id
     WHERE r.game_id = $1 AND r.status = 'closed'
     ORDER BY r.closed_at DESC NULLS LAST LIMIT 1`,
    [GAME_ID]
  );
  if (flying.rows[0]) return { ...flying.rows[0], phaseHint: 'flying' };

  const open = await pool.query(
    `SELECT r.id AS "roundId", r.status, r.result, r.scheduled_result AS "scheduledResult",
            r.flying_started_at AS "flyingStartedAt", r.closes_at AS "closesAt",
            GREATEST(0, EXTRACT(EPOCH FROM (r.closes_at - NOW()))::INT) AS "timerLeft",
            gs.min_bet AS "minBet", gs.max_bet AS "maxBet"
     FROM game_rounds r
     JOIN game_settings gs ON gs.game_id = r.game_id
     WHERE r.game_id = $1 AND r.status = 'open'
     ORDER BY r.started_at DESC LIMIT 1`,
    [GAME_ID]
  );
  if (open.rows[0]) return { ...open.rows[0], phaseHint: 'betting' };

  return null;
}

function roundPhase(round) {
  if (!round) return 'waiting';
  if (round.phaseHint) return round.phaseHint;
  if (round.status === 'closed') return 'flying';
  if (round.status === 'declared') return 'crashed';
  if (round.status === 'open') return 'betting';
  return 'waiting';
}

function currentFlyingMultiplier(round) {
  if (!round?.flyingStartedAt) return 1;
  const elapsed = (Date.now() - new Date(round.flyingStartedAt).getTime()) / 1000;
  return multiplierAtElapsed(elapsed);
}

router.get('/state', optionalAuth, async (req, res) => {
  try {
    const round = await getCurrentRound();
    const phase = roundPhase(round);
    const rawCrash = round?.scheduledResult || round?.result || null;
    const crashPoint = isValidCrash(rawCrash) ? Number(rawCrash) : null;
    const isFlying = phase === 'flying';
    const isCrashed = phase === 'crashed';
    const liveMult = isFlying
      ? currentFlyingMultiplier(round)
      : isCrashed
        ? crashPoint
        : 1;

    const flyingStartedAt = isFlying ? round?.flyingStartedAt || null : null;

    let myBet = null;
    if (req.user?.id && round?.roundId) {
      const { rows } = await pool.query(
        `SELECT id, amount, cashout_multiplier AS "cashoutMultiplier", status, payout
         FROM aviator_bets WHERE user_id = $1 AND round_id = $2 LIMIT 1`,
        [req.user.id, round.roundId]
      );
      if (rows[0]) myBet = rows[0];
    }

    const { rows: histRows } = await pool.query(
      `SELECT id AS "roundId", result AS multiplier, declared_at AS "declaredAt"
       FROM game_rounds
       WHERE game_id = $1 AND status = 'declared' AND result IS NOT NULL
         AND result ~ '^[0-9]+(\\.[0-9]+)?$'
         AND (result::numeric) >= $2
         AND (result::numeric) <= 13
       ORDER BY declared_at DESC NULLS LAST LIMIT 20`,
      [GAME_ID, MIN_CRASH]
    );

    const recentWinners = await getRecentWinners();
    const topWinners = await getTopWinners();
    const roundBets = await getRoundBets(round?.roundId, req.user?.id);
    const hasActiveBet = myBet?.status === 'active';
    const timerLeft = round?.timerLeft ?? 0;

    return ok(res, {
      roundId: round?.roundId ?? null,
      phase,
      timerLeft,
      closesAt: phase === 'betting' ? round?.closesAt || null : null,
      betWindowSeconds: BET_WINDOW_SECONDS,
      bettingOpen: phase === 'betting' && timerLeft > 0,
      crashPoint: isFlying || isCrashed ? crashPoint : null,
      multiplier: liveMult,
      flyingStartedAt,
      showPlane: isFlying,
      hasActiveBet,
      canCashout: isFlying && hasActiveBet,
      waitingForNextRound: phase === 'betting' && !hasActiveBet,
      myBet,
      recentWinners,
      topWinners,
      roundBets,
      minBet: Number(round?.minBet) || 10,
      maxBet: Number(round?.maxBet) || 10000,
      history: histRows.map((h) => ({
        id: h.roundId,
        multiplier: Number(h.multiplier) || 1,
      })),
    });
  } catch (e) {
    return err(res, e.message || 'Failed to load aviator state', 500);
  }
});

router.post('/bet', authenticatePlayer, async (req, res) => {
  const client = await pool.connect();
  try {
    const amount = Number(req.body?.amount);
    if (!Number.isFinite(amount) || amount < 10) return err(res, 'Minimum bet is ₹10');

    await client.query('BEGIN');

    const roundRes = await client.query(
      `SELECT r.id, r.closes_at, gs.min_bet, gs.max_bet
       FROM game_rounds r
       JOIN game_settings gs ON gs.game_id = r.game_id
       WHERE r.game_id = $1 AND r.status = 'open' ORDER BY r.started_at DESC LIMIT 1 FOR UPDATE`,
      [GAME_ID]
    );
    if (!roundRes.rows[0]) {
      await client.query('ROLLBACK');
      return err(res, 'Round in progress — wait for the next betting window', 400);
    }

    const round = roundRes.rows[0];
    const secLeft = await client.query(
      `SELECT EXTRACT(EPOCH FROM (closes_at - NOW()))::INT AS left FROM game_rounds WHERE id = $1`,
      [round.id]
    );
    if ((secLeft.rows[0]?.left ?? 0) <= 0) {
      await client.query('ROLLBACK');
      return err(res, 'Betting closed — wait for next round', 400);
    }

    const minBet = Number(round.min_bet) || 10;
    const maxBet = Number(round.max_bet) || 10000;
    if (amount < minBet || amount > maxBet) {
      await client.query('ROLLBACK');
      return err(res, `Bet must be between ₹${minBet} and ₹${maxBet}`);
    }

    const existing = await client.query(
      `SELECT id FROM aviator_bets WHERE user_id = $1 AND round_id = $2`,
      [req.user.id, round.id]
    );
    if (existing.rows[0]) {
      await client.query('ROLLBACK');
      return err(res, 'You already have a bet this round', 400);
    }

    const balance = await walletDelta(client, req.user.id, -amount, 'bet', 'aviator bet', String(round.id));

    const { rows } = await client.query(
      `INSERT INTO aviator_bets (user_id, round_id, amount, status) VALUES ($1, $2, $3, 'active') RETURNING id, amount, status`,
      [req.user.id, round.id, amount]
    );

    await client.query(
      `UPDATE game_rounds SET total_pot = COALESCE(total_pot, 0) + $1,
       winners_count = (SELECT COUNT(DISTINCT user_id) FROM aviator_bets WHERE round_id = $2)
       WHERE id = $2`,
      [amount, round.id]
    );

    await client.query('COMMIT');
    return ok(res, { betId: rows[0].id, roundId: Number(round.id), amount, balance }, 201);
  } catch (e) {
    await client.query('ROLLBACK');
    return err(res, e.message || 'Bet failed', e.status || 500);
  } finally {
    client.release();
  }
});

router.post('/cashout', authenticatePlayer, async (req, res) => {
  const client = await pool.connect();
  try {
    const roundId = Number(req.body?.roundId);
    if (!roundId) return err(res, 'roundId required');

    await client.query('BEGIN');

    const roundRes = await client.query(
      `SELECT id, status, scheduled_result, flying_started_at FROM game_rounds WHERE id = $1 AND game_id = $2 FOR UPDATE`,
      [roundId, GAME_ID]
    );
    if (!roundRes.rows[0] || roundRes.rows[0].status !== 'closed') {
      await client.query('ROLLBACK');
      return err(res, 'Plane is not flying — cannot cash out now', 400);
    }

    const round = roundRes.rows[0];
    const crashPoint = normalizeCrashPoint(round.scheduled_result);
    const requestedMult = currentFlyingMultiplier({
      flyingStartedAt: round.flying_started_at,
    });

    if (requestedMult >= crashPoint) {
      await client.query('ROLLBACK');
      return err(res, 'Too late — plane already crashed', 400);
    }

    const betRes = await client.query(
      `SELECT * FROM aviator_bets WHERE user_id = $1 AND round_id = $2 AND status = 'active' FOR UPDATE`,
      [req.user.id, roundId]
    );
    if (!betRes.rows[0]) {
      await client.query('ROLLBACK');
      return err(res, 'No active bet this round', 400);
    }

    const bet = betRes.rows[0];
    const amount = Number(bet.amount);
    const mult = effectiveCashoutMultiplier(amount, requestedMult, crashPoint);
    const payout = Math.round(amount * mult * 100) / 100;

    const balance = await walletDelta(client, req.user.id, payout, 'win', 'aviator cashout', String(roundId));

    await client.query(
      `UPDATE aviator_bets SET status = 'cashed_out', cashout_multiplier = $1, payout = $2 WHERE id = $3`,
      [mult, payout, bet.id]
    );

    await client.query('COMMIT');
    return ok(res, {
      status: 'cashed_out',
      multiplier: mult,
      payout,
      balance,
      roundId,
    });
  } catch (e) {
    await client.query('ROLLBACK');
    return err(res, e.message || 'Cashout failed', e.status || 500);
  } finally {
    client.release();
  }
});

module.exports = router;
