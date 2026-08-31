const pool = require('../config/database');
const Round = require('../models/Round');
const { ROUND_DRIVEN_GAMES, pickAutoWinner } = require('../utils/gameCatalog');
const { generateCrashPoint, multiplierAtElapsed, normalizeCrashPoint, elapsedForMultiplier, isValidCrash } = require('../backend/helpers/aviatorEngine');
const { broadcastAviator, broadcastGame } = require('./websocketServer');

const PREVIEW_SECONDS = 10;
const AVIATOR_BET_SECONDS = 15;
const AVIATOR_CRASH_DISPLAY_SECONDS = 3;
let timer = null;
let isTicking = false;

async function getActiveRoundGames() {
  try {
    const { rows } = await pool.query(`
      SELECT g.id AS game_id, gs.manual_result_mode, gs.auto_result_interval, gs.enabled, g.status
      FROM platform_games g
      JOIN game_settings gs ON gs.game_id = g.id
      WHERE g.status = 'active' AND gs.enabled = TRUE AND gs.maintenance_mode = FALSE
    `);
    return rows.filter((r) => ROUND_DRIVEN_GAMES.has(r.game_id));
  } catch (e) {
    return [];
  }
}

async function ensureOpenRound(gameId, intervalSec) {
  try {
    const open = await pool.query(
      `SELECT id, closes_at FROM game_rounds WHERE game_id = $1 AND status = 'open' ORDER BY started_at DESC LIMIT 1`,
      [gameId]
    );
    if (open.rows[0]) return open.rows[0];

    const last = await pool.query(
      `SELECT round_number FROM game_rounds WHERE game_id = $1 ORDER BY round_number DESC LIMIT 1`,
      [gameId]
    );
    const nextNum = last.rows[0] ? last.rows[0].round_number + 1 : 1;
    const { rows } = await pool.query(
      `INSERT INTO game_rounds (game_id, round_number, status, started_at, closes_at)
       VALUES ($1, $2, 'open', NOW(), NOW() + ($3 || ' seconds')::interval)
       RETURNING id, closes_at`,
      [gameId, nextNum, intervalSec]
    );
    return rows[0];
  } catch (e) {
    return null;
  }
}

async function scheduleAviatorCrash(roundId) {
  try {
    const stats = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) AS total, COUNT(*)::INT AS cnt, COALESCE(AVG(amount), 0) AS avg
       FROM aviator_bets WHERE round_id = $1`,
      [roundId]
    );
    const row = stats.rows[0] || {};
    const crash = generateCrashPoint({
      totalPot: Number(row.total),
      betCount: Number(row.cnt),
      avgBet: Number(row.avg),
    });
    const normalized = normalizeCrashPoint(crash, {
      totalPot: Number(row.total),
      betCount: Number(row.cnt),
      avgBet: Number(row.avg),
    });
    await pool.query(
      `UPDATE game_rounds SET scheduled_result = $1, preview_at = NOW() WHERE id = $2 AND scheduled_result IS NULL`,
      [String(normalized), roundId]
    );
    return normalized;
  } catch (e) {
    return 2.0;
  }
}

async function schedulePreviewIfNeeded(gameId, roundId, manualMode) {
  if (manualMode) return;

  try {
    const round = await pool.query(
      `SELECT id, scheduled_result, closes_at,
              EXTRACT(EPOCH FROM (closes_at - NOW()))::INT AS seconds_left
       FROM game_rounds WHERE id = $1 AND status = 'open'`,
      [roundId]
    );
    if (!round.rows[0]) return;
    const { scheduled_result, seconds_left } = round.rows[0];
    if (scheduled_result || seconds_left == null || seconds_left > PREVIEW_SECONDS) return;

    if (gameId === 'aviator') {
      await scheduleAviatorCrash(roundId);
      return;
    }

    const dist = await Round.getBetDistribution(gameId);
    const distribution = dist?.distribution || {};
    const winner = pickAutoWinner(distribution, gameId);

    await pool.query(
      `UPDATE game_rounds SET scheduled_result = $1, preview_at = NOW() WHERE id = $2 AND scheduled_result IS NULL`,
      [winner, roundId]
    );
  } catch {
    // Ignore transient pool delay
  }
}

async function tickAviator(game) {
  const manualMode = Boolean(game.manual_result_mode);
  const betSeconds = AVIATOR_BET_SECONDS;

  try {
    const openExists = await pool.query(
      `SELECT id FROM game_rounds WHERE game_id = 'aviator' AND status = 'open' LIMIT 1`
    );
    if (!openExists.rows[0]) {
      const stale = await pool.query(
        `SELECT id FROM game_rounds WHERE game_id = 'aviator' AND status = 'declared'
         AND declared_at <= NOW() - ($1 || ' seconds')::interval
         AND NOT EXISTS (SELECT 1 FROM game_rounds WHERE game_id = 'aviator' AND status IN ('open','closed'))
         ORDER BY declared_at DESC LIMIT 1`,
        [AVIATOR_CRASH_DISPLAY_SECONDS]
      );
      if (stale.rows[0]) {
        try {
          await Round.startNew('aviator');
        } catch {
          // Ignore
        }
      }
    }

    const flying = await pool.query(
      `SELECT id, scheduled_result,
              EXTRACT(EPOCH FROM (NOW() - flying_started_at))::FLOAT AS elapsed_seconds
       FROM game_rounds
       WHERE game_id = 'aviator' AND status = 'closed' ORDER BY closed_at DESC LIMIT 1`
    );
    if (flying.rows[0]) {
      const stats = await pool.query(
        `SELECT COALESCE(SUM(amount), 0) AS total, COUNT(*)::INT AS cnt, COALESCE(AVG(amount), 0) AS avg
         FROM aviator_bets WHERE round_id = $1`,
        [flying.rows[0].id]
      );
      const row = stats.rows[0] || {};
      const betStats = {
        totalPot: Number(row.total),
        betCount: Number(row.cnt),
        avgBet: Number(row.avg),
      };
      const crash = normalizeCrashPoint(flying.rows[0].scheduled_result, betStats);
      const elapsed = Math.max(0, Number(flying.rows[0].elapsed_seconds || 0));
      const mult = multiplierAtElapsed(elapsed);
      const requiredElapsed = elapsedForMultiplier(crash);
      if (elapsed >= requiredElapsed || mult >= crash) {
        try {
          await Round.finalizeAviatorRound(flying.rows[0].id, String(crash), !manualMode);
          broadcastAviator({
            type: 'ROUND_PHASE',
            phase: 'crashed',
            roundId: Number(flying.rows[0].id),
            crashPoint: crash,
            declaredAt: Date.now(),
          });
        } catch {
          // Ignore
        }
      }
      return;
    }

    const round = await ensureOpenRound('aviator', betSeconds);
    if (!round) return;
    const roundId = round.id;

    const status = await pool.query(
      `SELECT r.id,
              EXTRACT(EPOCH FROM (r.closes_at - NOW()))::INT AS seconds_left,
              r.scheduled_result
       FROM game_rounds r
       WHERE r.id = $1 AND r.status = 'open'`,
      [roundId]
    );
    if (!status.rows[0]) return;
    const { seconds_left, scheduled_result } = status.rows[0];

    if (!manualMode && seconds_left != null && seconds_left <= 2 && !scheduled_result) {
      await schedulePreviewIfNeeded('aviator', roundId, manualMode);
    }

    if (seconds_left != null && seconds_left <= 0) {
      if (manualMode) {
        await pool.query(
          `UPDATE game_rounds SET status = 'closed', closed_at = NOW() WHERE id = $1 AND status = 'open'`,
          [roundId]
        );
        return;
      }

      const stats = await pool.query(
        `SELECT COALESCE(SUM(amount), 0) AS total, COUNT(*)::INT AS cnt, COALESCE(AVG(amount), 0) AS avg
         FROM aviator_bets WHERE round_id = $1`,
        [roundId]
      );
      const row = stats.rows[0] || {};
      const betStats = {
        totalPot: Number(row.total),
        betCount: Number(row.cnt),
        avgBet: Number(row.avg),
      };

      let crash = normalizeCrashPoint(scheduled_result, betStats);
      if (!isValidCrash(scheduled_result)) {
        crash = await scheduleAviatorCrash(roundId) || generateCrashPoint(betStats);
        crash = normalizeCrashPoint(crash, betStats);
      }

      await pool.query(
        `UPDATE game_rounds SET status = 'closed', closed_at = NOW(), flying_started_at = NOW(), scheduled_result = $1
         WHERE id = $2 AND status = 'open'`,
        [String(crash), roundId]
      );

      broadcastAviator({
        type: 'ROUND_PHASE',
        phase: 'flying',
        roundId: Number(roundId),
        crashPoint: crash,
        flightElapsed: 0,
        flyingStartedAt: Date.now(),
      });
    } else if (seconds_left != null && seconds_left > 0) {
      broadcastAviator({
        type: 'ROUND_PHASE',
        phase: 'betting',
        roundId: Number(roundId),
        timerLeft: seconds_left,
        betWindowSeconds: betSeconds,
      });
    }
  } catch {
    // Graceful error handler
  }
}

async function tickGame(game) {
  if (game.game_id === 'aviator') {
    return tickAviator(game);
  }

  try {
    const interval = Math.max(15, Number(game.auto_result_interval) || 30);
    const round = await ensureOpenRound(game.game_id, interval);
    if (!round) return;
    const roundId = round.id;

    const status = await pool.query(
      `SELECT r.id,
              EXTRACT(EPOCH FROM (r.closes_at - NOW()))::INT AS seconds_left,
              r.scheduled_result
       FROM game_rounds r
       WHERE r.id = $1 AND r.status = 'open'`,
      [roundId]
    );
    if (!status.rows[0]) return;
    const { seconds_left, scheduled_result } = status.rows[0];
    const manualMode = Boolean(game.manual_result_mode);

    if (seconds_left != null && seconds_left > 0) {
      broadcastGame(game.game_id, {
        type: 'ROUND_TICK',
        gameId: game.game_id,
        roundId: Number(roundId),
        timerLeft: seconds_left,
        bettingOpen: seconds_left > 5,
        timestamp: Date.now(),
      });
    }

    if (seconds_left != null && seconds_left <= 0) {
      if (manualMode) {
        await pool.query(
          `UPDATE game_rounds SET status = 'closed', closed_at = NOW() WHERE id = $1 AND status = 'open'`,
          [roundId]
        );
        return;
      }

      const current = await pool.query(
        `SELECT scheduled_result FROM game_rounds WHERE id = $1`,
        [roundId]
      );
      let result = current.rows[0]?.scheduled_result;
      if (!result) {
        const dist = await Round.getBetDistribution(game.game_id);
        result = pickAutoWinner(dist?.distribution || {}, game.game_id);
      }
      try {
        const declared = await Round.declare(game.game_id, result, roundId);
        broadcastGame(game.game_id, {
          type: 'ROUND_RESULT',
          gameId: game.game_id,
          roundId: Number(roundId),
          result,
          status: 'declared',
          payoutTotal: declared?.payoutTotal || 0,
        });

        const newRound = await Round.startNew(game.game_id);
        if (newRound) {
          broadcastGame(game.game_id, {
            type: 'ROUND_START',
            gameId: game.game_id,
            roundId: Number(newRound.roundId || newRound.id),
            timerLeft: interval,
            bettingOpen: true,
          });
        }
      } catch (e) {
        // Handled
      }
    }
  } catch {
    // Handled
  }
}

async function tick() {
  if (isTicking) return;
  isTicking = true;
  try {
    const games = await getActiveRoundGames();
    for (const game of games) {
      await tickGame(game);
    }
  } catch {
    // Handled
  } finally {
    isTicking = false;
  }
}

function startRoundEngine() {
  if (timer) return;
  tick();
  timer = setInterval(tick, 2000);
  console.log('Round engine started (auto/manual, 10s admin preview)');
}

function stopRoundEngine() {
  if (timer) clearInterval(timer);
  timer = null;
}

module.exports = { startRoundEngine, stopRoundEngine, tick, PREVIEW_SECONDS };
