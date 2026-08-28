const express = require('express');
const { getTransactions, getStats, getPending, approve, reject } = require('../controllers/transactionsController');
const { authenticateAdmin } = require('../middleware/auth');
const { requireAdminOrAbove, validatePagination, validateId } = require('../middleware/validate');

const router = express.Router();

router.use(authenticateAdmin);

router.get('/', validatePagination, getTransactions);
router.get('/stats', getStats);
router.get('/pending', getPending);
router.patch('/:id/approve', validateId(), requireAdminOrAbove, approve);
router.patch('/:id/reject', validateId(), requireAdminOrAbove, reject);

module.exports = router;
