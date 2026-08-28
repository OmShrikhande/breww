const crypto = require('crypto');

const { getEnv } = require('../config/env');

const engineFetch = async (path, { method = 'GET', body } = {}) => {
  const base = (getEnv('ENGINE_API_BASE_URL') || '').replace(/\/$/, '');
  if (!base) return null;

  const headers = {
    'Content-Type': 'application/json',
    'X-Internal-Api-Key': getEnv('ENGINE_INTERNAL_API_KEY') || '',
  };

  const res = await fetch(`${base}${path.startsWith('/') ? path : `/${path}`}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    const error = new Error(data.message || `Engine error ${res.status}`);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
};

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

module.exports = { engineFetch, hashToken };
