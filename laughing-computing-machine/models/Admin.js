const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

class Admin {
  static async findByEmail(email) {
    const { rows } = await pool.query(
      `SELECT id, name, email, password_hash, role, last_login, is_active FROM admins WHERE email = $1`,
      [email]
    );
    return rows[0];
  }

  static async findById(id) {
    const { rows } = await pool.query(
      `SELECT id, name, email, role, last_login, is_active FROM admins WHERE id = $1`,
      [id]
    );
    return rows[0];
  }

  static async validatePassword(password, hash) {
    return bcrypt.compare(password, hash);
  }

  static async updateLastLogin(id) {
    await pool.query(`UPDATE admins SET last_login = NOW() WHERE id = $1`, [id]);
  }

  static async createSession(adminId, token, ip, userAgent) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await pool.query(
      `INSERT INTO admin_sessions (admin_id, token_hash, ip_address, user_agent, expires_at) VALUES ($1,$2,$3,$4,$5)`,
      [adminId, tokenHash, ip, userAgent, expiresAt]
    );
  }

  static async findSession(token) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const { rows } = await pool.query(
      `SELECT id, admin_id, expires_at FROM admin_sessions WHERE token_hash = $1`,
      [tokenHash]
    );
    return rows[0];
  }

  static async deleteSession(token) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    await pool.query(`DELETE FROM admin_sessions WHERE token_hash = $1`, [tokenHash]);
  }

  static async logLogin(adminId, email, ip, userAgent, success) {
    await pool.query(
      `INSERT INTO admin_login_logs (admin_id, email, ip_address, user_agent, success) VALUES ($1,$2,$3,$4,$5)`,
      [adminId || null, email, ip, userAgent, success]
    );
  }

  static async getLoginLogs(adminId) {
    const { rows } = await pool.query(
      `SELECT ip_address AS ip, user_agent AS "userAgent", created_at AS time, success FROM admin_login_logs WHERE admin_id = $1 ORDER BY created_at DESC LIMIT 50`,
      [adminId]
    );
    return rows;
  }
}

module.exports = Admin;
