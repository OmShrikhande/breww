const pool = require('../config/database');

class User {
  static async findById(id) {
    const { rows } = await pool.query(
      `SELECT id, username, email, phone, status, vip_level, balance, total_bets, total_win, total_loss, last_active, joined_at FROM users WHERE id = $1`,
      [id]
    );
    return rows[0];
  }

  static async findAll({ search, status, vip, page = 1, limit = 20, sortBy = 'joined_at', sortDir = 'DESC' }) {
    const offset = (page - 1) * limit;
    const allowed = ['id', 'username', 'email', 'balance', 'total_bets', 'joined_at', 'last_active'];
    const col = allowed.includes(sortBy) ? sortBy : 'joined_at';
    const dir = sortDir === 'ASC' ? 'ASC' : 'DESC';

    let where = 'WHERE 1=1';
    const values = [];
    let p = 1;

    if (search) {
      where += ` AND (username ILIKE $${p} OR email ILIKE $${p} OR phone ILIKE $${p})`;
      values.push(`%${search}%`);
      p++;
    }
    if (status) {
      where += ` AND status = $${p}`;
      values.push(status);
      p++;
    }
    if (vip) {
      where += ` AND vip_level = $${p}`;
      values.push(vip);
      p++;
    }

    const countRes = await pool.query(`SELECT COUNT(*) FROM users ${where}`, values);
    const total = parseInt(countRes.rows[0].count);

    values.push(limit, offset);
    const { rows } = await pool.query(
      `SELECT id, username, email, phone, status, vip_level, balance, total_bets, total_win, total_loss, last_active, joined_at FROM users ${where} ORDER BY ${col} ${dir} LIMIT $${p} OFFSET $${p + 1}`,
      values
    );
    return { users: rows, total, page: parseInt(page), limit: parseInt(limit) };
  }

  static async getStats() {
    const { rows } = await pool.query(`
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE status = 'active') AS active,
        COUNT(*) FILTER (WHERE status = 'suspended') AS suspended,
        COUNT(*) FILTER (WHERE status = 'banned') AS banned,
        COUNT(*) FILTER (WHERE vip_level = 'Diamond') AS "diamondVips"
      FROM users
    `);
    return rows[0];
  }

  static async updateStatus(id, status) {
    const { rows } = await pool.query(
      `UPDATE users SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING id, status`,
      [status, id]
    );
    return rows[0];
  }

  static async adjustBalance(id, action, amount) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const user = await client.query(`SELECT balance FROM users WHERE id = $1 FOR UPDATE`, [id]);
      if (!user.rows[0]) { await client.query('ROLLBACK'); return null; }

      let newBalance = parseFloat(user.rows[0].balance);
      const adjustAmount = parseFloat(amount) || 0;

      if (action === 'reset') newBalance = 0;
      else if (action === 'add') newBalance = Math.round((newBalance + adjustAmount) * 100) / 100;
      else if (action === 'subtract') newBalance = Math.max(0, Math.round((newBalance - adjustAmount) * 100) / 100);

      const { rows } = await client.query(
        `UPDATE users SET balance = $1, updated_at = NOW() WHERE id = $2 RETURNING id, balance AS "newBalance"`,
        [newBalance, id]
      );
      await client.query(
        `INSERT INTO user_balance_ledger (user_id, type, amount, balance_after, note) VALUES ($1,'admin_adjust',$2,$3,$4)`,
        [id, adjustAmount, newBalance, `Admin ${action}`]
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

  static async getBets(userId) {
    const { rows } = await pool.query(
      `SELECT rb.id AS "betId", pg.name AS game, rb.amount, rb.option_id AS result,
              rb.payout, rb.won, rb.placed_at AS "createdAt"
       FROM round_bets rb
       JOIN game_rounds gr ON gr.id = rb.round_id
       JOIN platform_games pg ON pg.id = gr.game_id
       WHERE rb.user_id = $1 ORDER BY rb.placed_at DESC LIMIT 100`,
      [userId]
    );
    return rows;
  }

  static async getTransactions(userId) {
    const { rows } = await pool.query(
      `SELECT id AS "txId", type, amount, status, method, requested_at AS "createdAt"
       FROM transactions WHERE user_id = $1 ORDER BY requested_at DESC LIMIT 100`,
      [userId]
    );
    return rows;
  }

  static async addNote(userId, adminId, text) {
    const { rows } = await pool.query(
      `INSERT INTO user_admin_notes (user_id, admin_id, note) VALUES ($1,$2,$3) RETURNING id AS "noteId", admin_id AS "adminId", note AS text, created_at AS "createdAt"`,
      [userId, adminId, text]
    );
    return rows[0];
  }

  static async getNotes(userId) {
    const { rows } = await pool.query(
      `SELECT n.id AS "noteId", a.name AS "adminName", n.note AS text, n.created_at AS "createdAt"
       FROM user_admin_notes n
       JOIN admins a ON a.id = n.admin_id
       WHERE n.user_id = $1 ORDER BY n.created_at DESC`,
      [userId]
    );
    return rows;
  }
}

module.exports = User;
