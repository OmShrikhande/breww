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
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: { success: false, message: 'Too many requests. Please try again in a few minutes.' },
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

function parseAuthIdentifier(method, rawIdentifier) {
  const raw = String(rawIdentifier || '').trim();
  if (!raw) return { error: 'Mobile number or email is required' };

  // Explicit email or contains '@'
  if (raw.includes('@') || method === 'email') {
    const email = raw.toLowerCase().trim();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email) || email.length > 100) {
      return { error: 'Please enter a valid email address (e.g. name@domain.com)' };
    }
    return { type: 'email', email, phone: null };
  }

  // Handle phone number
  let digits = raw.replace(/\D/g, '');
  
  // If starts with country code 91 and has 12 digits, strip 91
  if (digits.length === 12 && digits.startsWith('91')) {
    digits = digits.slice(2);
  }
  // If starts with leading 0 and has 11 digits, strip 0
  else if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1);
  }

  // Strict check: Mobile number should not be greater than 10 or less than 10 digits
  if (digits.length !== 10) {
    return { error: 'Mobile number must be exactly 10 digits' };
  }

  if (!/^[6-9]\d{9}$/.test(digits)) {
    return { error: 'Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9' };
  }

  return { type: 'phone', phone: digits, email: null };
}

router.post('/register', loginLimiter, async (req, res) => {
  try {
    const { method = 'email', identifier, password, inviteCode } = req.body || {};
    if (!identifier || !password) return err(res, 'Identifier and password are required', 400);
    if (String(password).length < 6) return err(res, 'Password must be at least 6 characters', 400);
    if (String(password).length > 32) return err(res, 'Password cannot exceed 32 characters', 400);

    const parsed = parseAuthIdentifier(method, identifier);
    if (parsed.error) return err(res, parsed.error, 400);

    const { email, phone } = parsed;

    if (email) {
      const exists = await pool.query('SELECT id FROM users WHERE LOWER(email) = $1', [email]);
      if (exists.rows.length) return err(res, 'This email is already registered. Please log in.', 409);
    }
    if (phone) {
      const exists = await pool.query('SELECT id FROM users WHERE phone = $1', [phone]);
      if (exists.rows.length) return err(res, 'This phone number is already registered. Please log in.', 409);
    }

    const hash = await bcrypt.hash(password, 10);
    const seedBalance = Number(getEnv('SEED_BALANCE', '10000')) || 10000;
    
    // Generate clean username
    const baseUsername = email
      ? email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '').slice(0, 15)
      : `user_${phone.slice(-4)}`;

    let finalUsername = baseUsername || `player_${Date.now().toString().slice(-4)}`;
    for (let i = 0; i < 10; i++) {
      const check = await pool.query('SELECT id FROM users WHERE username = $1', [finalUsername]);
      if (!check.rows.length) break;
      finalUsername = `${baseUsername}_${Math.floor(Math.random() * 9000 + 1000)}`;
    }

    const cleanInviteCode = inviteCode ? String(inviteCode).trim().slice(0, 30) : null;

    const inserted = await pool.query(
      `INSERT INTO users (username, email, phone, password_hash, balance, invite_code)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, username, email, phone, balance, vip_level, status`,
      [finalUsername, email || null, phone || null, hash, seedBalance, cleanInviteCode]
    );

    const user = inserted.rows[0];
    const token = signToken(user.id);
    const expiresAt = await createSession(user.id, token, req);

    return ok(res, { token, expiresAt, user: publicUser(user) }, 201);
  } catch (e) {
    console.error('Register error:', e.message);
    return err(res, e.message || 'Registration failed. Please try again.', 500);
  }
});

router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { method = 'email', identifier, password } = req.body || {};
    if (!identifier || !password) return err(res, 'Identifier and password are required', 400);

    const parsed = parseAuthIdentifier(method, identifier);
    if (parsed.error) return err(res, parsed.error, 400);

    let result;
    if (parsed.phone) {
      result = await pool.query('SELECT * FROM users WHERE phone = $1 OR username = $1 LIMIT 1', [parsed.phone]);
    } else {
      result = await pool.query('SELECT * FROM users WHERE LOWER(email) = $1 OR username = $1 LIMIT 1', [parsed.email]);
    }

    if (!result.rows.length) return err(res, 'Invalid mobile number/email or password', 401);
    const user = result.rows[0];
    if (user.status !== 'active') return err(res, 'Account suspended or inactive. Please contact support.', 403);

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return err(res, 'Invalid mobile number/email or password', 401);

    const token = signToken(user.id);
    const expiresAt = await createSession(user.id, token, req);
    await pool.query('UPDATE users SET last_active = NOW() WHERE id = $1', [user.id]);

    return ok(res, { token, expiresAt, user: publicUser(user) });
  } catch (e) {
    console.error('Login error:', e.message);
    return err(res, 'Login failed. Please check your credentials.', 500);
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
    return ok(res, { message: 'Logged out successfully' });
  } catch (e) {
    return err(res, 'Logout failed', 500);
  }
});

module.exports = router;
