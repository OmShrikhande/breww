const express = require('express');
const { login, logout, me, refresh, loginLogs } = require('../controllers/authController');
const { authenticateAdmin } = require('../middleware/auth');
const { loginLimiter, checkBruteForce } = require('../middleware/security');

const router = express.Router();

router.post('/login', loginLimiter, checkBruteForce, login);
router.post('/admin/login', loginLimiter, checkBruteForce, login);
router.post('/logout', authenticateAdmin, logout);
router.get('/me', authenticateAdmin, me);
router.post('/refresh', authenticateAdmin, refresh);
router.get('/login-logs', authenticateAdmin, loginLogs);

module.exports = router;
