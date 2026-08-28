const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const initDb = require('./database/init');
const { getEnv } = require('./config/env');

function createPlayerApp() {
  const app = express();

  const allowedOrigins = (getEnv('ALLOWED_ORIGINS') || getEnv('FRONTEND_URL', 'http://localhost:5173'))
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  app.set('trust proxy', 1);
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  }));
  app.use(express.json({ limit: '100kb' }));

  app.use('/api/', rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    message: { success: false, message: 'Too many requests' },
  }));

  app.get('/health', (_req, res) => {
    res.json({ success: true, service: 'player-api' });
  });

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'OK', service: 'player-api' });
  });

  const gamesRoutes = require('./routes/games');
  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/wallet', require('./routes/wallet'));
  app.use('/api/user', require('./routes/user'));
  app.use('/api/games', gamesRoutes);
  app.use('/api', gamesRoutes);

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
  const PORT = Number(getEnv('PORT', '3001')) || 3001;

  try {
    await initDb();
  } catch (e) {
    console.error('Player DB init failed:', e.message);
    console.error('Server will still listen; fix DATABASE_URL / network access.');
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
