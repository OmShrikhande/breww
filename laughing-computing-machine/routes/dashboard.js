const express = require('express');
const { getStats, weeklyRevenue, topGames, liveActivity, gameStatus } = require('../controllers/dashboardController');
const { authenticateAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateAdmin);

router.get('/stats', getStats);
router.get('/weekly-revenue', weeklyRevenue);
router.get('/top-games', topGames);
router.get('/live-activity', liveActivity);
router.get('/game-status', gameStatus);

module.exports = router;
