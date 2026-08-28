const { Client } = require('pg');

function getDbConfigFromEnv(env = process.env) {
  if (env.DATABASE_URL) {
    const url = new URL(env.DATABASE_URL);
    return {
      host: url.hostname,
      port: Number(url.port) || 5432,
      database: url.pathname.replace(/^\//, ''),
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
    };
  }
  return {
    host: env.DB_HOST || 'localhost',
    port: Number(env.DB_PORT) || 5432,
    database: env.DB_NAME || 'games_db',
    user: env.DB_USER || 'postgres',
    password: env.DB_PASSWORD || '',
  };
}

async function ensureDatabase(config) {
  const { host, port, database, user, password } = config;
  if (!/^[a-zA-Z0-9_]+$/.test(database)) {
    throw new Error(`Invalid database name: ${database}`);
  }

  const client = new Client({
    host,
    port,
    user,
    password,
    database: 'postgres',
  });

  try {
    await client.connect();
    const exists = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [database]);
    if (exists.rows.length === 0) {
      await client.query(`CREATE DATABASE ${database}`);
      console.log(`Created database "${database}"`);
    }
  } finally {
    await client.end();
  }
}

module.exports = { ensureDatabase, getDbConfigFromEnv };
