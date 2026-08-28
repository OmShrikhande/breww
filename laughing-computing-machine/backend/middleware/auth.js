const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { hashToken } = require('../helpers/engine');
const { err } = require('../helpers/response');
const { getEnv } = require('../config/env');

const authenticatePlayer = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return err(res, 'Unauthorized', 401);

    try {
      jwt.verify(token, getEnv('JWT_SECRET'));
    } catch {
      return err(res, 'Invalid or expired token', 401);
    }

    const tokenHash = hashToken(token);
    const session = await pool.query(
      `SELECT s.id, u.id AS user_id, u.username, u.email, u.phone, u.balance, u.status, u.vip_level
       FROM player_sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.token_hash = $1 AND s.expires_at > NOW()
       LIMIT 1`,
      [tokenHash]
    );

    if (!session.rows.length) return err(res, 'Session expired', 401);
    const row = session.rows[0];
    if (row.status && row.status !== 'active') return err(res, 'Account not active', 403);

    req.user = {
      id: row.user_id,
      username: row.username,
      email: row.email,
      phone: row.phone,
      balance: Number(row.balance),
      vipLevel: row.vip_level,
      status: row.status,
    };
    req.token = token;
    next();
  } catch (e) {
    console.error('Auth error:', e.message);
    return err(res, 'Unauthorized', 401);
  }
};

const optionalAuth = async (req, res, next) => {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return next();
  return authenticatePlayer(req, res, next);
};

module.exports = { authenticatePlayer, optionalAuth };
