const express = require('express');
const pool = require('../config/database');
const { ok, err } = require('../helpers/response');
const { authenticatePlayer } = require('../middleware/auth');

const router = express.Router();

router.get('/profile', authenticatePlayer, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, username, email, phone, balance, vip_level, status, total_bets, total_win, total_loss, joined_at
       FROM users WHERE id = $1`,
      [req.user.id]
    );
    const u = result.rows[0];
    if (!u) return err(res, 'Not found', 404);
    return ok(res, {
      id: u.id,
      name: u.username,
      username: u.username,
      email: u.email,
      phone: u.phone,
      balance: Number(u.balance),
      vipLevel: u.vip_level,
      status: u.status,
      totalBets: u.total_bets,
      totalWin: Number(u.total_win),
      totalLoss: Number(u.total_loss),
      joinedAt: u.joined_at,
    });
  } catch (e) {
    return err(res, 'Failed to load profile', 500);
  }
});

router.patch('/settings', authenticatePlayer, async (req, res) => {
  try {
    // Placeholder for future settings (theme, notifications, etc.)
    return ok(res, { success: true, settings: req.body || {} });
  } catch (e) {
    return err(res, 'Failed to update settings', 500);
  }
});

router.get('/notifications', authenticatePlayer, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, type, title, body, read, created_at AS "createdAt"
       FROM player_notifications
       WHERE user_id IS NULL OR user_id = $1
       ORDER BY created_at DESC LIMIT 50`,
      [req.user.id]
    );
    return ok(res, result.rows);
  } catch (e) {
    return err(res, 'Failed to load notifications', 500);
  }
});

module.exports = router;
