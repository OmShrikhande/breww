const express = require('express');
const { getGames, getGameById, updateSettings, updateStatus, bulkStatus } = require('../controllers/gamesController');
const { getCurrent, getBetDistribution, declare, getHistory, getRoundDetail, startNew } = require('../controllers/roundController');
const { authenticateAdmin } = require('../middleware/auth');
const { requireAdminOrAbove, validateId } = require('../middleware/validate');

const router = express.Router();

router.use(authenticateAdmin);

router.get('/', getGames);
router.get('/:id', validateId(), getGameById);
router.patch('/:id/settings', validateId(), requireAdminOrAbove, updateSettings);
router.patch('/:id/status', validateId(), requireAdminOrAbove, updateStatus);
router.post('/bulk-status', requireAdminOrAbove, bulkStatus);

router.get('/:id/round/current', validateId(), getCurrent);
router.get('/:id/round/bet-distribution', validateId(), getBetDistribution);
router.post('/:id/round/declare', validateId(), requireAdminOrAbove, declare);
router.get('/:id/round/history', validateId(), getHistory);
router.get('/:id/round/history/:roundId', validateId(), getRoundDetail);
router.post('/:id/round/new', validateId(), requireAdminOrAbove, startNew);

module.exports = router;
