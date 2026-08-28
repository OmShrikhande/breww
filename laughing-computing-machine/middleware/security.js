const rateLimit = require('express-rate-limit');
const pool = require('../config/database');

const MAX_LOGIN_ATTEMPTS = parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5;
const LOCKOUT_MINUTES = parseInt(process.env.LOCKOUT_MINUTES) || 15;

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later' }
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { success: false, message: 'Too many login attempts, please try again in 15 minutes' }
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: parseInt(process.env.API_RATE_LIMIT) || 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Rate limit exceeded' }
});

const checkBruteForce = async (req, res, next) => {
  const email = req.body.email;
  if (!email) return next();

  try {
    const windowStart = new Date(Date.now() - LOCKOUT_MINUTES * 60 * 1000);
    const { rows } = await pool.query(
      `SELECT COUNT(*) AS attempts FROM admin_login_logs
       WHERE email = $1 AND success = FALSE AND created_at > $2`,
      [email.toLowerCase().trim(), windowStart]
    );
    if (parseInt(rows[0].attempts) >= MAX_LOGIN_ATTEMPTS) {
      return res.status(429).json({
        success: false,
        message: `Account temporarily locked due to too many failed attempts. Try again in ${LOCKOUT_MINUTES} minutes.`
      });
    }
    next();
  } catch {
    next();
  }
};

const sanitizeBody = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    for (const key of Object.keys(req.body)) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    }
  }
  next();
};

const sanitizeQuery = (req, res, next) => {
  if (req.query && typeof req.query === 'object') {
    for (const key of Object.keys(req.query)) {
      if (typeof req.query[key] === 'string') {
        req.query[key] = req.query[key].trim();
      }
    }
  }
  next();
};

const securityHeaders = (req, res, next) => {
  res.removeHeader('X-Powered-By');
  next();
};

module.exports = { globalLimiter, loginLimiter, apiLimiter, checkBruteForce, sanitizeBody, sanitizeQuery, securityHeaders };
