const express = require('express');
const pool = require('../config/database');
const { ok, err } = require('../helpers/response');
const { authenticatePlayer } = require('../middleware/auth');

const router = express.Router();

router.get('/balance', authenticatePlayer, async (req, res) => {
  try {
    const result = await pool.query('SELECT balance FROM users WHERE id = $1', [req.user.id]);
    return ok(res, { balance: Number(result.rows[0]?.balance || 0) });
  } catch (e) {
    return err(res, 'Failed to fetch balance', 500);
  }
});

router.get('/ledger', authenticatePlayer, async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const result = await pool.query(
      `SELECT id, type, amount, balance_after AS "balanceAfter", note, created_at AS "createdAt"
       FROM user_balance_ledger WHERE user_id = $1
       ORDER BY created_at DESC LIMIT $2`,
      [req.user.id, limit]
    );
    return ok(res, result.rows);
  } catch (e) {
    return err(res, 'Failed to fetch ledger', 500);
  }
});

/** Adjust balance (internal helper used by games; also exposed for demo win/loss sync). */
router.post('/adjust', authenticatePlayer, async (req, res) => {
  const client = await pool.connect();
  try {
    const amount = Number(req.body?.amount);
    const type = req.body?.type || 'admin_adjust';
    const note = req.body?.note || null;
    if (!Number.isFinite(amount) || amount === 0) return err(res, 'Invalid amount');

    await client.query('BEGIN');
    const locked = await client.query('SELECT balance FROM users WHERE id = $1 FOR UPDATE', [req.user.id]);
    const current = Number(locked.rows[0].balance);
    const next = current + amount;
    if (next < 0) {
      await client.query('ROLLBACK');
      return err(res, 'Insufficient balance', 400);
    }

    await client.query('UPDATE users SET balance = $1, updated_at = NOW() WHERE id = $2', [next, req.user.id]);
    await client.query(
      `INSERT INTO user_balance_ledger (user_id, type, amount, balance_after, note)
       VALUES ($1, $2, $3, $4, $5)`,
      [req.user.id, type, amount, next, note]
    );
    await client.query('COMMIT');
    return ok(res, { balance: next, previousBalance: current });
  } catch (e) {
    await client.query('ROLLBACK');
    return err(res, e.message || 'Adjust failed', 500);
  } finally {
    client.release();
  }
});

module.exports = router;
