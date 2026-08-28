const { Pool } = require('pg');
const { getEnv } = require('./env');

let connectionString = getEnv('DATABASE_URL', '');
if (connectionString && !/[?&]sslmode=/.test(connectionString)) {
  connectionString += connectionString.includes('?')
    ? '&uselibpqcompat=true&sslmode=require'
    : '?uselibpqcompat=true&sslmode=require';
}

const poolConfig = connectionString
  ? {
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 15000,
    }
  : {
      host: getEnv('DB_HOST', 'localhost'),
      port: Number(getEnv('DB_PORT', '5432')),
      database: getEnv('DB_NAME', 'games_db'),
      user: getEnv('DB_USER', 'postgres'),
      password: getEnv('DB_PASSWORD', ''),
      max: 20,
    };

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('Player PostgreSQL pool error:', err.message);
});

module.exports = pool;
