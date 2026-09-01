const pool = require('../config/database');

const initDb = async () => {
  const queries = [
    `CREATE TABLE IF NOT EXISTS admins (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL DEFAULT 'Admin',
      email VARCHAR(150) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'admin' CHECK (role IN ('superadmin','admin','viewer')),
      last_login TIMESTAMP NULL,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )`,

    `CREATE TABLE IF NOT EXISTS admin_sessions (
      id SERIAL PRIMARY KEY,
      admin_id INT REFERENCES admins(id) ON DELETE CASCADE,
      token_hash VARCHAR(255) NOT NULL,
      ip_address VARCHAR(45),
      user_agent TEXT,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )`,

    `CREATE TABLE IF NOT EXISTS admin_login_logs (
      id SERIAL PRIMARY KEY,
      admin_id INT REFERENCES admins(id) ON DELETE SET NULL,
      email VARCHAR(150),
      ip_address VARCHAR(45),
      user_agent TEXT,
      success BOOLEAN NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )`,

    `CREATE TABLE IF NOT EXISTS platform_games (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      category VARCHAR(50),
      icon VARCHAR(10),
      tagline TEXT,
      accent_color VARCHAR(20),
      gradient TEXT,
      status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','inactive','maintenance')),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )`,

    `CREATE TABLE IF NOT EXISTS game_settings (
      id SERIAL PRIMARY KEY,
      game_id VARCHAR(50) UNIQUE REFERENCES platform_games(id) ON DELETE CASCADE,
      enabled BOOLEAN DEFAULT TRUE,
      maintenance_mode BOOLEAN DEFAULT FALSE,
      manual_result_mode BOOLEAN DEFAULT FALSE,
      auto_result_interval INT DEFAULT 60,
      min_bet DECIMAL(12,2) DEFAULT 1.00,
      max_bet DECIMAL(12,2) DEFAULT 10000.00,
      house_edge DECIMAL(5,2) DEFAULT 5.00,
      rtp DECIMAL(5,2) DEFAULT 95.00,
      commission_rate DECIMAL(5,2) DEFAULT 2.00,
      extra_config JSONB DEFAULT '{}',
      updated_at TIMESTAMP DEFAULT NOW()
    )`,

    `CREATE TABLE IF NOT EXISTS game_stats_daily (
      id SERIAL PRIMARY KEY,
      game_id VARCHAR(50) REFERENCES platform_games(id) ON DELETE CASCADE,
      date DATE NOT NULL,
      players_online INT DEFAULT 0,
      bets_count INT DEFAULT 0,
      revenue DECIMAL(14,2) DEFAULT 0,
      win_rate DECIMAL(5,2) DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(game_id, date)
    )`,

    `CREATE TABLE IF NOT EXISTS game_rounds (
      id BIGSERIAL PRIMARY KEY,
      game_id VARCHAR(50) REFERENCES platform_games(id) ON DELETE CASCADE,
      round_number INT NOT NULL DEFAULT 1,
      status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open','closed','declared','completed')),
      result VARCHAR(50) NULL,
      admin_set BOOLEAN DEFAULT FALSE,
      total_pot DECIMAL(14,2) DEFAULT 0,
      winners_count INT DEFAULT 0,
      payout_total DECIMAL(14,2) DEFAULT 0,
      started_at TIMESTAMP DEFAULT NOW(),
      closed_at TIMESTAMP NULL,
      declared_at TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )`,

    `CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(150) UNIQUE,
      phone VARCHAR(20) NULL,
      password_hash VARCHAR(255) NOT NULL,
      status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','suspended','banned')),
      vip_level VARCHAR(20) DEFAULT 'None' CHECK (vip_level IN ('None','Bronze','Silver','Gold','Platinum','Diamond')),
      balance DECIMAL(14,2) DEFAULT 0.00,
      total_bets INT DEFAULT 0,
      total_win DECIMAL(14,2) DEFAULT 0.00,
      total_loss DECIMAL(14,2) DEFAULT 0.00,
      last_active TIMESTAMP NULL,
      joined_at TIMESTAMP DEFAULT NOW(),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )`,

    `CREATE TABLE IF NOT EXISTS round_bets (
      id BIGSERIAL PRIMARY KEY,
      round_id BIGINT REFERENCES game_rounds(id) ON DELETE CASCADE,
      user_id INT REFERENCES users(id) ON DELETE CASCADE,
      option_id VARCHAR(50) NOT NULL,
      amount DECIMAL(12,2) NOT NULL,
      payout DECIMAL(12,2) NULL,
      won BOOLEAN NULL,
      placed_at TIMESTAMP DEFAULT NOW()
    )`,

    `CREATE TABLE IF NOT EXISTS user_balance_ledger (
      id BIGSERIAL PRIMARY KEY,
      user_id INT REFERENCES users(id) ON DELETE CASCADE,
      type VARCHAR(30) NOT NULL CHECK (type IN ('deposit','withdrawal','bet','win','bonus','admin_adjust')),
      amount DECIMAL(12,2) NOT NULL,
      balance_after DECIMAL(14,2) NOT NULL,
      ref_id VARCHAR(100) NULL,
      note TEXT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )`,

    `CREATE TABLE IF NOT EXISTS user_admin_notes (
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users(id) ON DELETE CASCADE,
      admin_id INT REFERENCES admins(id) ON DELETE SET NULL,
      note TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )`,

    `CREATE TABLE IF NOT EXISTS transactions (
      id BIGSERIAL PRIMARY KEY,
      user_id INT REFERENCES users(id) ON DELETE CASCADE,
      type VARCHAR(20) NOT NULL CHECK (type IN ('deposit','withdrawal')),
      amount DECIMAL(12,2) NOT NULL,
      fee DECIMAL(10,2) DEFAULT 0.00,
      net_amount DECIMAL(12,2) NOT NULL,
      method VARCHAR(30) NOT NULL CHECK (method IN ('upi','net_banking','card','crypto')),
      status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','processing')),
      gateway_ref VARCHAR(200) NULL,
      rejection_note TEXT NULL,
      requested_at TIMESTAMP DEFAULT NOW(),
      processed_at TIMESTAMP NULL,
      processed_by INT REFERENCES admins(id) ON DELETE SET NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )`,

    `CREATE TABLE IF NOT EXISTS platform_settings (
      id SERIAL PRIMARY KEY,
      group_name VARCHAR(50) NOT NULL,
      key VARCHAR(100) NOT NULL,
      value TEXT,
      updated_by INT REFERENCES admins(id) ON DELETE SET NULL,
      updated_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(group_name, key)
    )`,

    `CREATE TABLE IF NOT EXISTS api_keys (
      id SERIAL PRIMARY KEY,
      key_hash VARCHAR(255) UNIQUE NOT NULL,
      key_preview VARCHAR(20) NOT NULL,
      is_active BOOLEAN DEFAULT TRUE,
      rotated_at TIMESTAMP NULL,
      created_by INT REFERENCES admins(id) ON DELETE SET NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )`,

    `CREATE TABLE IF NOT EXISTS webhook_logs (
      id BIGSERIAL PRIMARY KEY,
      event_type VARCHAR(100) NOT NULL,
      payload JSONB,
      response_code INT NULL,
      response_time INT NULL,
      success BOOLEAN NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )`,

    `CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      type VARCHAR(30) NOT NULL CHECK (type IN ('big_win','new_user','maintenance','security','payout','system')),
      title VARCHAR(200) NOT NULL,
      body TEXT,
      read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW()
    )`,

    `CREATE TABLE IF NOT EXISTS activity_log (
      id BIGSERIAL PRIMARY KEY,
      type VARCHAR(10) NOT NULL CHECK (type IN ('win','loss','join','game','sys')),
      game_id VARCHAR(50) NULL,
      user_id INT NULL,
      action TEXT NOT NULL,
      amount DECIMAL(12,2) NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )`,

    `CREATE INDEX IF NOT EXISTS idx_game_rounds_game_status ON game_rounds(game_id, status)`,
    `CREATE INDEX IF NOT EXISTS idx_game_rounds_game_started ON game_rounds(game_id, started_at DESC)`,
    `CREATE INDEX IF NOT EXISTS idx_round_bets_round_option ON round_bets(round_id, option_id)`,
    `CREATE INDEX IF NOT EXISTS idx_users_status ON users(status)`,
    `CREATE INDEX IF NOT EXISTS idx_users_vip ON users(vip_level)`,
    `CREATE INDEX IF NOT EXISTS idx_users_last_active ON users(last_active)`,
    `CREATE INDEX IF NOT EXISTS idx_transactions_status_type ON transactions(status, type)`,
    `CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id)`,
    `CREATE INDEX IF NOT EXISTS idx_game_stats_date ON game_stats_daily(date DESC)`,
    `CREATE INDEX IF NOT EXISTS idx_game_stats_game_date ON game_stats_daily(game_id, date)`,
    `CREATE INDEX IF NOT EXISTS idx_activity_log_created ON activity_log(created_at DESC)`,
    `CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(token_hash)`,
    `CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin ON admin_sessions(admin_id)`,

    `ALTER TABLE game_rounds ADD COLUMN IF NOT EXISTS scheduled_result VARCHAR(50)`,
    `ALTER TABLE game_rounds ADD COLUMN IF NOT EXISTS preview_at TIMESTAMP`,
    `ALTER TABLE game_rounds ADD COLUMN IF NOT EXISTS closes_at TIMESTAMP`,
    `ALTER TABLE game_rounds ADD COLUMN IF NOT EXISTS flying_started_at TIMESTAMP`,

    // Enable Row-Level Security (RLS) on all public tables to prevent unauthorized direct Supabase PostgREST access
    `ALTER TABLE IF EXISTS admins ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE IF EXISTS admin_sessions ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE IF EXISTS admin_login_logs ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE IF EXISTS platform_games ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE IF EXISTS game_settings ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE IF EXISTS game_stats_daily ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE IF EXISTS game_rounds ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE IF EXISTS round_bets ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE IF EXISTS user_balance_ledger ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE IF EXISTS user_admin_notes ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE IF EXISTS transactions ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE IF EXISTS platform_settings ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE IF EXISTS api_keys ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE IF EXISTS webhook_logs ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE IF EXISTS notifications ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE IF EXISTS activity_log ENABLE ROW LEVEL SECURITY`,

    `UPDATE game_settings SET manual_result_mode = FALSE WHERE manual_result_mode IS DISTINCT FROM FALSE`,
    `UPDATE game_settings SET auto_result_interval = 10 WHERE game_id = 'aviator'`,
    `UPDATE game_rounds SET scheduled_result = NULL
     WHERE game_id = 'aviator' AND status IN ('open','closed')
       AND (scheduled_result IS NULL OR scheduled_result !~ '^[0-9]+(\\.[0-9]+)?$' OR (scheduled_result::numeric) < 1.5 OR (scheduled_result::numeric) > 13)`,
  ];

  for (const query of queries) {
    try {
      await pool.query(query);
    } catch (err) {
      const isMigration = /^(ALTER TABLE|UPDATE game_)/i.test(query.trim());
      if (isMigration) {
        console.warn(`Migration skipped: ${err.message}`);
        continue;
      }
      console.error(`Error executing query: ${query}`);
      throw err;
    }
  }

  await seedDefaultData();
  console.log('Database initialized successfully');
};

const seedDefaultData = async () => {
  const bcrypt = require('bcryptjs');

  const adminCheck = await pool.query('SELECT id FROM admins WHERE email = $1', ['admin@gmail.com']);
  if (adminCheck.rows.length === 0) {
    const hash = await bcrypt.hash('admin123', 12);
    await pool.query(
      `INSERT INTO admins (name, email, password_hash, role) VALUES ($1, $2, $3, $4)`,
      ['Super Admin', 'admin@gmail.com', hash, 'superadmin']
    );
    console.log('Default admin created: admin@gmail.com / admin123');
  }

  const defaultGames = [
    { id: 'colour', name: 'Colour Prediction', category: 'Prediction', icon: '🎨', tagline: 'Predict the winning colour', accent_color: '#e74c3c', gradient: 'linear-gradient(135deg,#e74c3c,#c0392b)' },
    { id: 'aviator', name: 'Aviator', category: 'Crash', icon: '✈️', tagline: 'Cash out before it crashes', accent_color: '#e67e22', gradient: 'linear-gradient(135deg,#e67e22,#d35400)' },
    { id: 'dice', name: 'Dice Roll', category: 'Dice', icon: '🎲', tagline: 'Roll the dice and win big', accent_color: '#3498db', gradient: 'linear-gradient(135deg,#3498db,#2980b9)' },
    { id: 'dragon-tiger', name: 'Dragon Tiger', category: 'Card', icon: '🐉', tagline: 'Dragon vs Tiger battle', accent_color: '#9b59b6', gradient: 'linear-gradient(135deg,#9b59b6,#8e44ad)' },
    { id: 'wheel', name: 'Spin Wheel', category: 'Wheel', icon: '🎡', tagline: 'Spin to win', accent_color: '#f59e0b', gradient: 'linear-gradient(135deg,#f59e0b,#d97706)' },
    { id: 'mines', name: 'Mines', category: 'Originals', icon: '💣', tagline: 'Avoid the mines', accent_color: '#64748b', gradient: 'linear-gradient(135deg,#64748b,#475569)' },
    { id: 'plinko', name: 'Plinko', category: 'Originals', icon: '🎯', tagline: 'Drop and win', accent_color: '#06b6d4', gradient: 'linear-gradient(135deg,#06b6d4,#0891b2)' },
    { id: 'andar-bahar', name: 'Andar Bahar', category: 'Card', icon: '🃏', tagline: 'Classic Indian card game', accent_color: '#8b5cf6', gradient: 'linear-gradient(135deg,#8b5cf6,#7c3aed)' },
    { id: 'roulette', name: 'Roulette', category: 'Table', icon: '🎰', tagline: 'European roulette', accent_color: '#22c55e', gradient: 'linear-gradient(135deg,#22c55e,#16a34a)' },
    { id: 'poker', name: 'Poker', category: 'Table', icon: '♠️', tagline: 'Texas holdem', accent_color: '#ef4444', gradient: 'linear-gradient(135deg,#ef4444,#dc2626)' },
    { id: 'chamber-risk', name: 'Chamber Risk', category: 'Originals', icon: '🔫', tagline: 'Risk and reward', accent_color: '#a855f7', gradient: 'linear-gradient(135deg,#a855f7,#9333ea)' },
    { id: 'parity', name: 'Parity', category: 'Prediction', icon: '🔢', tagline: 'Even or Odd prediction', accent_color: '#1abc9c', gradient: 'linear-gradient(135deg,#1abc9c,#16a085)' },
  ];

  for (const g of defaultGames) {
    const exists = await pool.query('SELECT id FROM platform_games WHERE id = $1', [g.id]);
    if (exists.rows.length === 0) {
      await pool.query(
        `INSERT INTO platform_games (id, name, category, icon, tagline, accent_color, gradient) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [g.id, g.name, g.category, g.icon, g.tagline, g.accent_color, g.gradient]
      );
      await pool.query(
        `INSERT INTO game_settings (game_id, manual_result_mode) VALUES ($1, FALSE)`,
        [g.id]
      );
    }
  }

  const defaultSettings = [
    ['general', 'siteName', 'Games Admin'],
    ['general', 'siteUrl', 'http://localhost:3000'],
    ['general', 'supportEmail', 'support@games.com'],
    ['general', 'currency', 'INR'],
    ['general', 'timezone', 'Asia/Kolkata'],
    ['general', 'maintenanceMode', 'false'],
    ['security', 'twoFactorRequired', 'false'],
    ['security', 'sessionTimeout', '1440'],
    ['security', 'maxLoginAttempts', '5'],
    ['security', 'rateLimiting', 'true'],
    ['payments', 'minDeposit', '100'],
    ['payments', 'maxDeposit', '100000'],
    ['payments', 'minWithdrawal', '500'],
    ['payments', 'maxWithdrawal', '50000'],
    ['payments', 'withdrawalFee', '2'],
    ['payments', 'upiEnabled', 'true'],
    ['notifications', 'emailAlerts', 'true'],
    ['notifications', 'bigWinAlert', 'true'],
    ['notifications', 'bigWinThreshold', '10000'],
    ['notifications', 'dailyReport', 'true'],
    ['api', 'webhookUrl', ''],
    ['api', 'webhookEnabled', 'false'],
    ['api', 'rateLimitPerMin', '60'],
    ['api', 'allowedOrigins', '*'],
    ['api', 'loggingEnabled', 'true']
  ];

  for (const [group, key, value] of defaultSettings) {
    await pool.query(
      `INSERT INTO platform_settings (group_name, key, value) VALUES ($1,$2,$3) ON CONFLICT (group_name, key) DO NOTHING`,
      [group, key, value]
    );
  }

  const apiKeyCheck = await pool.query('SELECT id FROM api_keys WHERE is_active = TRUE LIMIT 1');
  if (apiKeyCheck.rows.length === 0) {
    const crypto = require('crypto');
    const rawKey = 'sk_live_' + crypto.randomBytes(24).toString('hex');
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
    const keyPreview = 'sk_live_••••' + rawKey.slice(-4);
    const adminRow = await pool.query('SELECT id FROM admins LIMIT 1');
    if (adminRow.rows.length > 0) {
      await pool.query(
        `INSERT INTO api_keys (key_hash, key_preview, created_by) VALUES ($1,$2,$3)`,
        [keyHash, keyPreview, adminRow.rows[0].id]
      );
    }
  }
};

module.exports = initDb;
