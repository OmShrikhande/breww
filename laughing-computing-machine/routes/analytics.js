const express = require('express');
const { revenue, bets, sessions, gameShare, peakHours, heatmap, winLoss, quickMetrics, exportReport } = require('../controllers/analyticsController');
const { authenticateAdmin } = require('../middleware/auth');
const { validatePeriod } = require('../middleware/validate');

const router = express.Router();

router.use(authenticateAdmin);

router.get('/revenue', validatePeriod, revenue);
router.get('/bets', validatePeriod, bets);
router.get('/sessions', validatePeriod, sessions);
router.get('/game-share', gameShare);
router.get('/peak-hours', peakHours);
router.get('/heatmap', heatmap);
router.get('/win-loss', winLoss);
router.get('/quick-metrics', quickMetrics);
router.post('/export', exportReport);

module.exports = router;
