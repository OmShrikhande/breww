const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

/** Parent laughing-computing-machine/.env — single source of truth for admin + player. */
function loadFileEnv() {
  const envPath = path.join(__dirname, '..', '..', '.env');
  if (!fs.existsSync(envPath)) return {};
  try {
    return dotenv.parse(fs.readFileSync(envPath));
  } catch {
    return {};
  }
}

const fileEnv = loadFileEnv();

/**
 * Player API env resolution order:
 * 1. PLAYER_* overrides on process.env (optional per-field overrides from parent deploy)
 * 2. Parent .env file (laughing-computing-machine/.env)
 * 3. process.env (after dotenv loaded parent .env in index.js or server.js)
 */
function getEnv(key, fallback = '') {
  const playerKey = `PLAYER_${key}`;
  if (process.env[playerKey] != null && process.env[playerKey] !== '') {
    return process.env[playerKey];
  }
  if (fileEnv[key] != null && fileEnv[key] !== '') {
    return fileEnv[key];
  }
  if (process.env[key] != null && process.env[key] !== '') {
    return process.env[key];
  }
  return fallback;
}

module.exports = { getEnv, fileEnv };
