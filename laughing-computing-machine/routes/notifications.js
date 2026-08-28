const express = require('express');
const { getAll, unreadCount, markRead, markAllRead, sendTest } = require('../controllers/notificationsController');
const { authenticateAdmin } = require('../middleware/auth');
const { validateId } = require('../middleware/validate');

const router = express.Router();

router.use(authenticateAdmin);

router.get('/', getAll);
router.get('/unread-count', unreadCount);
router.patch('/read-all', markAllRead);
router.patch('/:id/read', validateId(), markRead);
router.post('/test', sendTest);

module.exports = router;
