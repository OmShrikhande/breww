const bcrypt = require('bcryptjs');
const pool = require('../config/database');

const STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','suspended','banned')),
    vip_level VARCHAR(20) DEFAULT 'None',
    balance DECIMAL(14,2) DEFAULT 0.00,
    total_bets INT DEFAULT 0,
    total_win DECIMAL(14,2) DEFAULT 0.00,
    total_loss DECIMAL(14,2) DEFAULT 0.00,
    invite_code VARCHAR(50),
    last_active TIMESTAMP NULL,
    joined_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS player_sessions (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS user_balance_ledger (
    id BIGSERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(30) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    balance_after DECIMAL(14,2) NOT NULL,
    ref_id VARCHAR(100),
    note TEXT,
    created_at TIMESTAMP DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS game_bets (
    id BIGSERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    game_id VARCHAR(50) NOT NULL,
    bet_payload JSONB NOT NULL DEFAULT '{}',
    amount DECIMAL(12,2) NOT NULL,
    payout DECIMAL(12,2) DEFAULT 0,
    result JSONB,
    status VARCHAR(20) DEFAULT 'settled',
    created_at TIMESTAMP DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS player_notifications (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(30) DEFAULT 'system',
    title VARCHAR(200) NOT NULL,
    body TEXT,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
  )`,
  `CREATE INDEX IF NOT EXISTS idx_player_sessions_user ON player_sessions(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_game_bets_user ON game_bets(user_id, created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_ledger_user ON user_balance_ledger(user_id, created_at DESC)`,
];

async function initDb() {
  for (const sql of STATEMENTS) {
    await pool.query(sql);
  }

  const { getEnv } = require('../config/env');
  const seedBalance = Number(getEnv('SEED_BALANCE', '10000')) || 10000;
  const existing = await pool.query(`SELECT id FROM users WHERE email = $1 OR phone = $2 LIMIT 1`, [
    'player@breeww.com',
    '9999999999',
  ]);

  if (existing.rows.length === 0) {
    const hash = await bcrypt.hash('Player@123', 10);
    await pool.query(
      `INSERT INTO users (username, email, phone, password_hash, balance, status)
       VALUES ($1, $2, $3, $4, $5, 'active')`,
      ['breeww_player', 'player@breeww.com', '9999999999', hash, seedBalance]
    );
    console.log('Seeded demo player: player@breeww.com / Player@123 (phone 9999999999)');
  }

  console.log('Player DB schema ready');
}

module.exports = initDb;
