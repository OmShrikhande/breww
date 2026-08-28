const pool = require('../config/database');
const crypto = require('crypto');

class Settings {
  static async getAll() {
    const { rows } = await pool.query(`SELECT group_name, key, value FROM platform_settings ORDER BY group_name, key`);
    const result = {};
    for (const row of rows) {
      if (!result[row.group_name]) result[row.group_name] = {};
      let val = row.value;
      if (val === 'true') val = true;
      else if (val === 'false') val = false;
      else if (!isNaN(val) && val !== '') val = parseFloat(val);
      result[row.group_name][row.key] = val;
    }
    return result;
  }

  static async getGroup(group) {
    const { rows } = await pool.query(`SELECT key, value FROM platform_settings WHERE group_name = $1`, [group]);
    const result = {};
    for (const row of rows) {
      let val = row.value;
      if (val === 'true') val = true;
      else if (val === 'false') val = false;
      else if (!isNaN(val) && val !== '') val = parseFloat(val);
      result[row.key] = val;
    }
    return result;
  }

  static ALLOWED_KEYS = {
    general: ['siteName','siteUrl','supportEmail','currency','timezone','maintenanceMode'],
    security: ['twoFactorRequired','sessionTimeout','maxLoginAttempts','rateLimiting'],
    payments: ['minDeposit','maxDeposit','minWithdrawal','maxWithdrawal','withdrawalFee','upiEnabled','netBankingEnabled','cardEnabled','cryptoEnabled'],
    notifications: ['emailAlerts','bigWinAlert','bigWinThreshold','dailyReport','smsAlerts'],
    api: ['webhookUrl','webhookEnabled','rateLimitPerMin','allowedOrigins','loggingEnabled']
  };

  static async upsertGroup(group, data, adminId) {
    const allowed = this.ALLOWED_KEYS[group] || [];
    for (const [key, value] of Object.entries(data)) {
      if (!allowed.includes(key)) continue;
      await pool.query(
        `INSERT INTO platform_settings (group_name, key, value, updated_by, updated_at)
         VALUES ($1,$2,$3,$4,NOW())
         ON CONFLICT (group_name, key) DO UPDATE SET value=$3, updated_by=$4, updated_at=NOW()`,
        [group, key, String(value), adminId]
      );
    }
    return this.getGroup(group);
  }

  static async getApiKey() {
    const { rows } = await pool.query(`SELECT key_preview AS "keyPreview" FROM api_keys WHERE is_active=TRUE ORDER BY created_at DESC LIMIT 1`);
    return rows[0] || { keyPreview: null };
  }

  static async rotateApiKey(adminId) {
    await pool.query(`UPDATE api_keys SET is_active=FALSE WHERE is_active=TRUE`);
    const rawKey = 'sk_live_' + crypto.randomBytes(24).toString('hex');
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
    const keyPreview = 'sk_live_••••' + rawKey.slice(-4);
    await pool.query(
      `INSERT INTO api_keys (key_hash, key_preview, is_active, rotated_at, created_by) VALUES ($1,$2,TRUE,NOW(),$3)`,
      [keyHash, keyPreview, adminId]
    );
    return { newKey: rawKey, rotatedAt: new Date() };
  }

  static async testWebhook() {
    const webhookRow = await pool.query(`SELECT value FROM platform_settings WHERE group_name='api' AND key='webhookUrl'`);
    const url = webhookRow.rows[0]?.value;
    if (!url) return { status: 'error', responseTime: 0, responseCode: null };

    const start = Date.now();
    try {
      const http = url.startsWith('https') ? require('https') : require('http');
      await new Promise((resolve, reject) => {
        const req = http.request(url, { method: 'POST', timeout: 5000 }, resolve);
        req.on('error', reject);
        req.write(JSON.stringify({ event: 'test', timestamp: new Date() }));
        req.end();
      });
      const responseTime = Date.now() - start;
      await pool.query(
        `INSERT INTO webhook_logs (event_type, payload, response_code, response_time, success) VALUES ('test','{}',200,$1,TRUE)`,
        [responseTime]
      );
      return { status: 'success', responseTime, responseCode: 200 };
    } catch {
      const responseTime = Date.now() - start;
      await pool.query(
        `INSERT INTO webhook_logs (event_type, payload, response_code, response_time, success) VALUES ('test','{}',NULL,$1,FALSE)`,
        [responseTime]
      );
      return { status: 'error', responseTime, responseCode: null };
    }
  }
}

module.exports = Settings;
