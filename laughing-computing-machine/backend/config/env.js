const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

/** Parse backend/.env without overwriting the parent (admin) process.env. */
function loadFileEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) return {};
  try {
    return dotenv.parse(fs.readFileSync(envPath));
  } catch {
    return {};
  }
}

const fileEnv = loadFileEnv();

/**
 * Prefer PLAYER_* from process (root deploy), then backend/.env values,
 * then generic process.env (standalone `npm run dev` in backend/).
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
