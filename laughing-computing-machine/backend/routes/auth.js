const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const pool = require('../config/database');
const { ok, err } = require('../helpers/response');
const { hashToken } = require('../helpers/engine');
const { authenticatePlayer } = require('../middleware/auth');
const { getEnv } = require('../config/env');

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  message: { success: false, message: 'Too many login attempts' },
});

const signToken = (userId) =>
  jwt.sign({ userId, role: 'player' }, getEnv('JWT_SECRET'), {
    expiresIn: getEnv('JWT_EXPIRES_IN', '24h'),
  });

const publicUser = (row) => ({
  id: row.id,
  username: row.username,
  email: row.email,
  phone: row.phone,
  balance: Number(row.balance),
  vipLevel: row.vip_level || 'None',
  status: row.status,
});

const createSession = async (userId, token, req) => {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await pool.query(
    `INSERT INTO player_sessions (user_id, token_hash, ip_address, user_agent, expires_at)
     VALUES ($1, $2, $3, $4, $5)`,
    [userId, hashToken(token), req.ip, req.get('user-agent') || '', expiresAt]
  );
  return expiresAt;
};

router.post('/register', loginLimiter, async (req, res) => {
  try {
    const { method = 'email', identifier, password, inviteCode } = req.body || {};
    if (!identifier || !password) return err(res, 'Identifier and password are required');
    if (String(password).length < 6) return err(res, 'Password must be at least 6 characters');

    const isPhone = method === 'phone' || /^\d{8,15}$/.test(String(identifier).replace(/\D/g, ''));
    const email = isPhone ? null : String(identifier).trim().toLowerCase();
    const phone = isPhone ? String(identifier).replace(/\D/g, '').slice(-10) : null;
    const username = email
      ? email.split('@')[0].slice(0, 40)
      : `user_${phone}`;

    if (email) {
      const exists = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
      if (exists.rows.length) return err(res, 'Email already registered', 409);
    }
    if (phone) {
      const exists = await pool.query('SELECT id FROM users WHERE phone = $1', [phone]);
      if (exists.rows.length) return err(res, 'Phone already registered', 409);
    }

    const hash = await bcrypt.hash(password, 10);
    const seedBalance = Number(getEnv('SEED_BALANCE', '10000')) || 10000;
    const baseUser = username;
    let finalUsername = baseUser;
    for (let i = 0; i < 5; i += 1) {
      const check = await pool.query('SELECT id FROM users WHERE username = $1', [finalUsername]);
      if (!check.rows.length) break;
      finalUsername = `${baseUser}${Math.floor(Math.random() * 9000 + 1000)}`;
    }

    const inserted = await pool.query(
      `INSERT INTO users (username, email, phone, password_hash, balance, invite_code)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, username, email, phone, balance, vip_level, status`,
      [finalUsername, email, phone, hash, seedBalance, inviteCode || null]
    );

    const user = inserted.rows[0];
    const token = signToken(user.id);
    const expiresAt = await createSession(user.id, token, req);

    return ok(res, { token, expiresAt, user: publicUser(user) }, 201);
  } catch (e) {
    console.error('Register error:', e.message);
    return err(res, e.message || 'Registration failed', 500);
  }
});

router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { method = 'email', identifier, password } = req.body || {};
    if (!identifier || !password) return err(res, 'Identifier and password are required');

    const isPhone = method === 'phone' || /^\d{8,15}$/.test(String(identifier).replace(/\D/g, ''));
    let result;
    if (isPhone) {
      const phone = String(identifier).replace(/\D/g, '').slice(-10);
      result = await pool.query('SELECT * FROM users WHERE phone = $1 LIMIT 1', [phone]);
    } else {
      const email = String(identifier).trim().toLowerCase();
      result = await pool.query('SELECT * FROM users WHERE email = $1 LIMIT 1', [email]);
    }

    if (!result.rows.length) return err(res, 'Invalid credentials', 401);
    const user = result.rows[0];
    if (user.status !== 'active') return err(res, 'Account not active', 403);

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return err(res, 'Invalid credentials', 401);

    const token = signToken(user.id);
    const expiresAt = await createSession(user.id, token, req);
    await pool.query('UPDATE users SET last_active = NOW() WHERE id = $1', [user.id]);

    return ok(res, { token, expiresAt, user: publicUser(user) });
  } catch (e) {
    console.error('Login error:', e.message);
    return err(res, 'Login failed', 500);
  }
});

router.get('/me', authenticatePlayer, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, username, email, phone, balance, vip_level, status, total_bets, total_win, total_loss, joined_at
       FROM users WHERE id = $1`,
      [req.user.id]
    );
    if (!result.rows.length) return err(res, 'User not found', 404);
    const u = result.rows[0];
    return ok(res, {
      ...publicUser(u),
      totalBets: u.total_bets,
      totalWin: Number(u.total_win),
      totalLoss: Number(u.total_loss),
      joinedAt: u.joined_at,
    });
  } catch (e) {
    return err(res, 'Failed to load profile', 500);
  }
});

router.post('/logout', authenticatePlayer, async (req, res) => {
  try {
    await pool.query('DELETE FROM player_sessions WHERE token_hash = $1', [hashToken(req.token)]);
    return ok(res, { message: 'Logged out' });
  } catch (e) {
    return err(res, 'Logout failed', 500);
  }
});

module.exports = router;
