const express = require('express');
const { getAll, updateGroup, getApiKey, rotateApiKey, testWebhook } = require('../controllers/settingsController');
const { authenticateAdmin } = require('../middleware/auth');
const { requireAdminOrAbove, requireSuperAdmin } = require('../middleware/validate');

const router = express.Router();

router.use(authenticateAdmin);

router.get('/', getAll);
router.patch('/general', requireAdminOrAbove, updateGroup('general'));
router.patch('/security', requireSuperAdmin, updateGroup('security'));
router.patch('/payments', requireSuperAdmin, updateGroup('payments'));
router.patch('/notifications', requireAdminOrAbove, updateGroup('notifications'));
router.patch('/api', requireSuperAdmin, updateGroup('api'));
router.get('/api-key', requireAdminOrAbove, getApiKey);
router.post('/api-key/rotate', requireSuperAdmin, rotateApiKey);
router.post('/webhook/test', requireAdminOrAbove, testWebhook);

module.exports = router;
