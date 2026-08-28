const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error('FATAL: JWT_SECRET must be set and at least 32 characters long');
  process.exit(1);
}

const initDb = require('./models/initDb');
const pool = require('./config/database');
const { ensureDatabase, getDbConfigFromEnv } = require('./config/ensureDatabase');
const { startRoundEngine } = require('./services/roundEngine');
const getSystemIP = require('./utils/getSystemIP');
const { globalLimiter, apiLimiter, sanitizeBody, sanitizeQuery, securityHeaders } = require('./middleware/security');
const { createPlayerApp, initDb: initPlayerDb } = require('./backend/server');

const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const gamesRoutes = require('./routes/games');
const usersRoutes = require('./routes/users');
const analyticsRoutes = require('./routes/analytics');
const transactionsRoutes = require('./routes/transactions');
const settingsRoutes = require('./routes/settings');
const notificationsRoutes = require('./routes/notifications');

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:4173', 'http://localhost:5174'];

app.set('trust proxy', 1);

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"]
    }
  },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

app.use(securityHeaders);
app.use(sanitizeBody);
app.use(sanitizeQuery);

// Player API — game polling should not hit admin rate limits
const playerApp = createPlayerApp({ skipBodyParser: true });
app.use('/player', playerApp);

app.use(globalLimiter);
app.use('/api', apiLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/games', gamesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/notifications', notificationsRoutes);

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    services: { admin: '/api', player: '/player/api' },
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Admin API is running',
  });
});

// Player API mounted under /player — same deploy, same public PORT (mounted above rate limiters)

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((error, req, res, next) => {
  if (error.message === 'Not allowed by CORS') {
    return res.status(403).json({ success: false, message: 'CORS: Origin not allowed' });
  }
  console.error('Unhandled error:', error.message);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

const cleanExpiredSessions = async () => {
  try {
    const { rowCount } = await pool.query(`DELETE FROM admin_sessions WHERE expires_at < NOW()`);
    if (rowCount > 0) console.log(`Cleaned ${rowCount} expired session(s)`);
  } catch (err) {
    console.error('Session cleanup error:', err.message);
  }
};

const startServer = async () => {
  try {
    const dbConfig = getDbConfigFromEnv();
    await ensureDatabase(dbConfig);
    console.log(`PostgreSQL ready: ${dbConfig.user}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
  } catch (dbBootstrapError) {
    console.error('PostgreSQL setup failed:', dbBootstrapError.message);
    console.error('Check DB_HOST, DB_PORT, DB_USER, DB_PASSWORD in laughing-computing-machine/.env');
  }

  try {
    await initDb();
    await cleanExpiredSessions();
    setInterval(cleanExpiredSessions, 60 * 60 * 1000);
  } catch (dbError) {
    console.error('Admin DB initialization failed:', dbError.message || dbError);
  }

  try {
    await initPlayerDb();
  } catch (playerDbError) {
    console.error('Player DB initialization failed:', playerDbError.message || playerDbError);
  }

  startRoundEngine();

  const HOST = getSystemIP();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Combined API on http://${HOST}:${PORT}`);
    console.log(`Admin:  http://localhost:${PORT}/api`);
    console.log(`Player: http://localhost:${PORT}/player/api`);
  });
};

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection (server kept alive):', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception (server kept alive):', error);
});
