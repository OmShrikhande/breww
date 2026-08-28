const express = require('express');
const { getUsers, getUserStats, getUserById, updateUserStatus, adjustBalance, getUserBets, getUserTransactions, addNote, getNotes } = require('../controllers/usersController');
const { authenticateAdmin } = require('../middleware/auth');
const { requireAdminOrAbove, validatePagination, validateId } = require('../middleware/validate');

const router = express.Router();

router.use(authenticateAdmin);

router.get('/', validatePagination, getUsers);
router.get('/stats', getUserStats);
router.get('/:id', validateId(), getUserById);
router.patch('/:id/status', validateId(), requireAdminOrAbove, updateUserStatus);
router.patch('/:id/balance', validateId(), requireAdminOrAbove, adjustBalance);
router.get('/:id/bets', validateId(), getUserBets);
router.get('/:id/transactions', validateId(), getUserTransactions);
router.post('/:id/notes', validateId(), requireAdminOrAbove, addNote);
router.get('/:id/notes', validateId(), getNotes);

module.exports = router;
