const pool = require('../config/database');

class Transaction {
  static async findAll({ type, status, page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    let where = 'WHERE 1=1';
    const values = [];
    let p = 1;
    if (type) { where += ` AND t.type = $${p}`; values.push(type); p++; }
    if (status) { where += ` AND t.status = $${p}`; values.push(status); p++; }

    const countRes = await pool.query(`SELECT COUNT(*) FROM transactions t ${where}`, values);
    const total = parseInt(countRes.rows[0].count);

    values.push(limit, offset);
    const { rows } = await pool.query(
      `SELECT t.id AS "txId", t.user_id AS "userId", u.username, t.type, t.amount, t.method, t.status, t.requested_at AS "createdAt"
       FROM transactions t JOIN users u ON u.id = t.user_id ${where} ORDER BY t.requested_at DESC LIMIT $${p} OFFSET $${p + 1}`,
      values
    );
    return { transactions: rows, total, page: parseInt(page), limit: parseInt(limit) };
  }

  static async getStats() {
    const { rows } = await pool.query(`
      SELECT
        COALESCE(SUM(amount) FILTER (WHERE type='deposit' AND status='approved'),0) AS "totalDeposits",
        COALESCE(SUM(amount) FILTER (WHERE type='withdrawal' AND status='approved'),0) AS "totalWithdrawals",
        COUNT(*) FILTER (WHERE status='pending' AND type='withdrawal') AS "pendingCount",
        COALESCE(SUM(amount) FILTER (WHERE status='pending' AND type='withdrawal'),0) AS "pendingAmount"
      FROM transactions
    `);
    return rows[0];
  }

  static async getPending() {
    const { rows } = await pool.query(`
      SELECT t.id AS "txId", t.user_id AS "userId", u.username, t.type, t.amount, t.method, t.requested_at AS "requestedAt"
      FROM transactions t JOIN users u ON u.id = t.user_id
      WHERE t.status='pending' ORDER BY t.requested_at ASC
    `);
    return rows;
  }

  static async create({ userId, type, amount, method }) {
    const fee = type === 'withdrawal' ? amount * 0.02 : 0;
    const net = type === 'withdrawal' ? amount - fee : amount;
    const { rows } = await pool.query(
      `INSERT INTO transactions (user_id, type, amount, fee, net_amount, method, status)
       VALUES ($1,$2,$3,$4,$5,$6,'pending')
       RETURNING id AS "txId", type, amount, method, status, requested_at AS "requestedAt"`,
      [userId, type, amount, fee, net, method]
    );
    return rows[0];
  }

  static async approve(id, adminId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const tx = await client.query(
        `SELECT * FROM transactions WHERE id = $1 AND status = 'pending' FOR UPDATE`,
        [id]
      );
      if (!tx.rows[0]) {
        await client.query('ROLLBACK');
        return null;
      }
      const row = tx.rows[0];

      if (row.type === 'deposit') {
        const bal = await client.query('SELECT balance FROM users WHERE id = $1 FOR UPDATE', [row.user_id]);
        const next = Number(bal.rows[0].balance) + Number(row.net_amount);
        await client.query('UPDATE users SET balance = $1, updated_at = NOW() WHERE id = $2', [next, row.user_id]);
        await client.query(
          `INSERT INTO user_balance_ledger (user_id, type, amount, balance_after, ref_id, note)
           VALUES ($1, 'deposit', $2, $3, $4, 'Recharge approved')`,
          [row.user_id, row.net_amount, next, String(row.id)]
        );
      } else if (row.type === 'withdrawal') {
        const bal = await client.query('SELECT balance FROM users WHERE id = $1 FOR UPDATE', [row.user_id]);
        const current = Number(bal.rows[0].balance);
        if (current < Number(row.amount)) throw new Error('User balance insufficient for withdrawal');
        const next = current - Number(row.amount);
        await client.query('UPDATE users SET balance = $1, updated_at = NOW() WHERE id = $2', [next, row.user_id]);
        await client.query(
          `INSERT INTO user_balance_ledger (user_id, type, amount, balance_after, ref_id, note)
           VALUES ($1, 'withdrawal', $2, $3, $4, 'Cashout approved')`,
          [row.user_id, -row.amount, next, String(row.id)]
        );
      }

      const { rows } = await client.query(
        `UPDATE transactions SET status='approved', processed_at=NOW(), processed_by=$1 WHERE id=$2
         RETURNING id AS "txId", status, processed_at AS "processedAt"`,
        [adminId, id]
      );
      await client.query('COMMIT');
      return rows[0];
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  static async reject(id, adminId, reason) {
    const { rows } = await pool.query(
      `UPDATE transactions SET status='rejected', rejection_note=$1, processed_at=NOW(), processed_by=$2
       WHERE id=$3 AND status='pending' RETURNING id AS "txId", status`,
      [reason, adminId, id]
    );
    return rows[0];
  }
}

module.exports = Transaction;
