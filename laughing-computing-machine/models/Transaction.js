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
      SELECT t.id AS "txId", t.user_id AS "userId", u.username, t.amount, t.method, t.requested_at AS "requestedAt"
      FROM transactions t JOIN users u ON u.id = t.user_id
      WHERE t.type='withdrawal' AND t.status='pending' ORDER BY t.requested_at ASC
    `);
    return rows;
  }

  static async approve(id, adminId) {
    const { rows } = await pool.query(
      `UPDATE transactions SET status='approved', processed_at=NOW(), processed_by=$1 WHERE id=$2 RETURNING id AS "txId", status, processed_at AS "processedAt"`,
      [adminId, id]
    );
    return rows[0];
  }

  static async reject(id, adminId, reason) {
    const { rows } = await pool.query(
      `UPDATE transactions SET status='rejected', rejection_note=$1, processed_at=NOW(), processed_by=$2 WHERE id=$3 RETURNING id AS "txId", status`,
      [reason, adminId, id]
    );
    return rows[0];
  }
}

module.exports = Transaction;
