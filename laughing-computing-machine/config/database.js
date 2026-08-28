const { Pool } = require('pg');
require('dotenv').config();

function isLocalDatabaseUrl(url) {
  try {
    const host = new URL(url).hostname;
    return host === 'localhost' || host === '127.0.0.1' || host === '::1';
  } catch {
    return false;
  }
}

let poolConfig;

if (process.env.DATABASE_URL) {
  const local = isLocalDatabaseUrl(process.env.DATABASE_URL);
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ...(local ? {} : { ssl: { rejectUnauthorized: false } }),
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  };
} else {
  // Local fallback (only if you install PostgreSQL locally)
  poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'games_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  };
}

const pool = new Pool(poolConfig);

// Success connection log
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

// Error handling
pool.on('error', (err) => {
  console.error('❌ Database connection error:', err.message);
});

module.exports = pool;