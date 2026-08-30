const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const rateLimit = require('express-rate-limit');
const initDb = require('./database/init');
const { getEnv } = require('./config/env');

// Standalone mode: load parent .env (laughing-computing-machine/.env)
if (require.main === module) {
  require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
}
function createPlayerApp({ skipBodyParser = false } = {}) {
  const app = express();

  const allowedOrigins = (getEnv('ALLOWED_ORIGINS') || getEnv('FRONTEND_URL', 'http://localhost:5173'))
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  app.set('trust proxy', 1);
  app.use(helmet({ contentSecurityPolicy: false }));
  const isOriginAllowed = (origin) => {
    if (!origin) return true;
    if (allowedOrigins.includes('*')) return true;
    if (allowedOrigins.includes(origin)) return true;
    try {
      const host = new URL(origin).hostname;
      if (host.endsWith('.vercel.app') || host.endsWith('.onrender.com') || host === 'localhost') {
        return true;
      }
    } catch {
      // ignore URL parsing error
    }
    return false;
  };

  app.use(cors({
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) return callback(null, true);
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  }));
  if (!skipBodyParser) {
    app.use(express.json({ limit: '100kb' }));
  }

  const writeLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 2000,
    message: { success: false, message: 'Too many requests' },
  });

  app.use('/api/', (req, res, next) => {
    if (req.method === 'GET') return next();
    return writeLimiter(req, res, next);
  });

  app.get('/health', (_req, res) => {
    res.json({ success: true, service: 'player-api' });
  });

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'OK', service: 'player-api' });
  });

const gamesRoutes = require('./routes/games');
  const platformGamesRoutes = require('./routes/platformGames');
  const minesRoutes = require('./routes/mines');
  const aviatorRoutes = require('./routes/aviator');
  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/wallet', require('./routes/wallet'));
  app.use('/api/user', require('./routes/user'));
  app.use('/api/mines', minesRoutes);
  app.use('/api/aviator', aviatorRoutes);
  app.use('/api/games', gamesRoutes);
  app.use('/api/games', platformGamesRoutes);

  app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));
  app.use((error, req, res, next) => {
    if (error.message === 'Not allowed by CORS') {
      return res.status(403).json({ success: false, message: 'CORS: Origin not allowed' });
    }
    console.error(error);
    res.status(500).json({ success: false, message: error.message || 'Internal server error' });
  });

  return app;
}

async function startPlayerServer() {
  const app = createPlayerApp();
  const PORT = Number(getEnv('PLAYER_PORT', getEnv('PORT', '3001'))) || 3001;

  if (require.main === module) {
    const { ensureDatabase, getDbConfigFromEnv } = require('../config/ensureDatabase');
    try {
      await ensureDatabase(getDbConfigFromEnv(process.env));
    } catch (e) {
      console.error('PostgreSQL setup failed:', e.message);
    }
  }

  try {
    await initDb();
  } catch (e) {
    console.error('Player DB init failed:', e.message || e);
  }
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Player API (standalone) on http://0.0.0.0:${PORT}`);
    console.log(`Health: http://localhost:${PORT}/api/health`);
  });

  return app;
}

module.exports = { createPlayerApp, startPlayerServer, initDb };

if (require.main === module) {
  startPlayerServer().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
