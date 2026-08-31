const express = require('express');
const pool = require('../config/database');
const Round = require('../../models/Round');
const { ok, err } = require('../helpers/response');
const { authenticatePlayer } = require('../middleware/auth');
const { PLATFORM_TO_PLAYER_PATH, resolvePlatformGameId, ROUND_DRIVEN_GAMES } = require('../../utils/gameCatalog');

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT g.id, g.name, g.category, g.icon, g.tagline, g.accent_color AS "accentColor", g.gradient, g.status,
             gs.min_bet AS "minBet", gs.max_bet AS "maxBet", gs.manual_result_mode AS "manualResultMode",
             gs.auto_result_interval AS "autoResultInterval"
      FROM platform_games g
      JOIN game_settings gs ON gs.game_id = g.id
      WHERE g.status = 'active' AND gs.enabled = TRUE AND gs.maintenance_mode = FALSE
      ORDER BY g.name
    `);
    const games = rows.map((g) => ({
      ...g,
      path: PLATFORM_TO_PLAYER_PATH[g.id] || `/game/${g.id}`,
      roundDriven: ROUND_DRIVEN_GAMES.has(g.id),
    }));
    return ok(res, games);
  } catch (e) {
    return err(res, 'Failed to load games', 500);
  }
});

router.get('/:gameId/round', async (req, res) => {
  try {
    const gameId = resolvePlatformGameId(req.params.gameId);
    const round = await Round.getCurrent(gameId);
    if (!round) return ok(res, { status: 'waiting', timerLeft: 0 });
    const playerView = {
      roundId: round.roundId,
      status: round.status,
      timerLeft: round.timerLeft,
      result: round.status === 'declared' ? round.result : null,
      bettingOpen: round.status === 'open' && round.timerLeft > 5,
    };
    return ok(res, playerView);
  } catch (e) {
    return err(res, e.message || 'Failed to load round', 500);
  }
});

router.get('/:gameId/round/history', async (req, res) => {
  try {
    const gameId = resolvePlatformGameId(req.params.gameId);
    const limit = Math.min(Number(req.query.limit) || 20, 50);
    const history = await Round.getHistory(gameId, 1, limit);
    return ok(res, history);
  } catch (e) {
    return err(res, 'Failed to load history', 500);
  }
});

const { broadcastGame, broadcastBalance } = require('../../services/websocketServer');

router.post('/:gameId/round/bet', authenticatePlayer, async (req, res) => {
  try {
    const gameId = resolvePlatformGameId(req.params.gameId);
    const optionId = String(req.body?.optionId || req.body?.option || '');
    const amount = Number(req.body?.amount);
    if (!optionId) return err(res, 'optionId is required');
    if (!Number.isFinite(amount) || amount <= 0) return err(res, 'Invalid amount');
    const data = await Round.placeBet(gameId, req.user.id, optionId, amount);

    // Broadcast real-time balance and game events
    broadcastBalance(req.user.id, data.balance);
    broadcastGame(gameId, {
      type: 'ROUND_NEW_BET',
      gameId,
      roundId: data.roundId,
      optionId,
      amount,
    });

    return ok(res, data);
  } catch (e) {
    return err(res, e.message || 'Bet failed', e.status || 400);
  }
});

module.exports = router;
