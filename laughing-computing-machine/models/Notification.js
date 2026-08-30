const pool = require('../config/database');

class Notification {
  static async findAll() {
    const { rows } = await pool.query(
      `SELECT id, title, body, type, "read", created_at AS "createdAt"
       FROM notifications ORDER BY created_at DESC LIMIT 100`
    );
    return rows;
  }

  static async unreadCount() {
    const { rows } = await pool.query(`SELECT COUNT(*) AS count FROM notifications WHERE "read"=FALSE`);
    return parseInt(rows[0].count, 10);
  }

  static async markRead(id) {
    const { rows } = await pool.query(
      `UPDATE notifications SET "read"=TRUE WHERE id=$1 RETURNING id, "read"`,
      [id]
    );
    return rows[0];
  }

  static async markAllRead() {
    const { rows } = await pool.query(`UPDATE notifications SET "read"=TRUE WHERE "read"=FALSE RETURNING id`);
    return rows.length;
  }

  static async create(type, title, body) {
    const { rows } = await pool.query(
      `INSERT INTO notifications (type, title, body) VALUES ($1,$2,$3) RETURNING id`,
      [type, title, body]
    );
    return rows[0];
  }
}

module.exports = Notification;
