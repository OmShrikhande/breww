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

router.post('/deposit', authenticatePlayer, async (req, res) => {
  try {
    const amount = Number(req.body?.amount);
    const method = req.body?.method || 'upi';
    if (!Number.isFinite(amount) || amount < 100) return err(res, 'Minimum recharge is ₹100');
    const Transaction = require('../../models/Transaction');
    const tx = await Transaction.create({ userId: req.user.id, type: 'deposit', amount, method });
    return ok(res, { ...tx, message: 'Recharge request submitted. Coins credited after admin approval.' }, 201);
  } catch (e) {
    return err(res, e.message || 'Deposit failed', 500);
  }
});

router.post('/withdraw', authenticatePlayer, async (req, res) => {
  const client = await pool.connect();
  try {
    const amount = Number(req.body?.amount);
    const method = req.body?.method || 'upi';
    if (!Number.isFinite(amount) || amount < 500) return err(res, 'Minimum cashout is ₹500');

    await client.query('BEGIN');
    const bal = await client.query('SELECT balance FROM users WHERE id = $1 FOR UPDATE', [req.user.id]);
    const balance = Number(bal.rows[0]?.balance || 0);
    if (balance < amount) {
      await client.query('ROLLBACK');
      return err(res, 'Insufficient balance', 400);
    }

    const pending = await client.query(
      `SELECT COUNT(*) FROM transactions WHERE user_id = $1 AND type = 'withdrawal' AND status = 'pending'`,
      [req.user.id]
    );
    if (Number(pending.rows[0].count) > 0) {
      await client.query('ROLLBACK');
      return err(res, 'You already have a pending cashout request', 400);
    }

    await client.query('COMMIT');
    const Transaction = require('../../models/Transaction');
    const tx = await Transaction.create({ userId: req.user.id, type: 'withdrawal', amount, method });
    return ok(res, { ...tx, message: 'Cashout request submitted. Processed after admin approval.' }, 201);
  } catch (e) {
    await client.query('ROLLBACK');
    return err(res, e.message || 'Withdraw failed', 500);
  } finally {
    client.release();
  }
});

router.get('/transactions', authenticatePlayer, async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 30, 100);
    const result = await pool.query(
      `SELECT id AS "txId", type, amount, method, status, requested_at AS "requestedAt", processed_at AS "processedAt"
       FROM transactions WHERE user_id = $1 ORDER BY requested_at DESC LIMIT $2`,
      [req.user.id, limit]
    );
    return ok(res, result.rows);
  } catch (e) {
    return err(res, 'Failed to load transactions', 500);
  }
});

module.exports = router;
