const { WebSocketServer, WebSocket } = require('ws');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { multiplierAtElapsed } = require('../backend/helpers/aviatorEngine');

let wss = null;
const clients = new Map(); // ws -> { userId, username, subscribedGames: Set }

function initWebSocketServer(server) {
  wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    const url = request.url || '';
    if (url.startsWith('/ws') || url.startsWith('/player/ws')) {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
  });

  wss.on('connection', (ws, req) => {
    const urlObj = new URL(req.url, 'http://localhost');
    const token = urlObj.searchParams.get('token');
    const clientState = {
      userId: null,
      username: null,
      subscribedGames: new Set(['aviator', 'colour', 'andar-bahar', 'dice', 'dragon-tiger', 'mines', 'roulette']),
    };

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        clientState.userId = decoded.id || decoded.userId;
        clientState.username = decoded.username;
      } catch {
        // Continue as unauthenticated guest
      }
    }

    clients.set(ws, clientState);

    // Send welcome & acknowledgment with initial connection state
    ws.send(JSON.stringify({
      type: 'INIT',
      authenticated: Boolean(clientState.userId),
      userId: clientState.userId,
      timestamp: Date.now(),
    }));

    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw);
        if (msg.action === 'auth' && msg.token) {
          try {
            const decoded = jwt.verify(msg.token, process.env.JWT_SECRET);
            clientState.userId = decoded.id || decoded.userId;
            clientState.username = decoded.username;
            ws.send(JSON.stringify({ type: 'AUTH_SUCCESS', userId: clientState.userId }));
          } catch {
            ws.send(JSON.stringify({ type: 'AUTH_ERROR', message: 'Invalid token' }));
          }
        } else if (msg.action === 'subscribe' && msg.gameId) {
          clientState.subscribedGames.add(msg.gameId);
        } else if (msg.action === 'ping') {
          ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
        }
      } catch {
        // Ignore malformed message
      }
    });

    ws.on('close', () => {
      clients.delete(ws);
    });

    ws.on('error', () => {
      clients.delete(ws);
    });
  });

  // Start continuous 50ms fast Aviator flight sync loop
  startAviatorBroadcastLoop();

  console.log('⚡ Unified WebSocket server initialized on /ws');
  return wss;
}

/** Broadcast event to all clients or matching channel filter */
function broadcast(data, filterFn = null) {
  if (!wss) return;
  const payload = JSON.stringify(data);

  for (const [ws, state] of clients.entries()) {
    if (ws.readyState === WebSocket.OPEN) {
      if (!filterFn || filterFn(state)) {
        try {
          ws.send(payload);
        } catch {
          clients.delete(ws);
        }
      }
    }
  }
}

/** Broadcast to users subscribed to Aviator */
function broadcastAviator(data) {
  broadcast(data, (state) => state.subscribedGames.has('aviator'));
}

/** Broadcast to users subscribed to a specific game (e.g. colour, andar-bahar, dice, dragon-tiger) */
function broadcastGame(gameId, data) {
  broadcast(data, (state) => state.subscribedGames.has(gameId));
}

/** Broadcast to all connected clients on the platform */
function broadcastPlatform(data) {
  broadcast(data);
}

/** Broadcast live balance update directly to a specific user */
function sendToUser(userId, data) {
  if (!wss || !userId) return;
  const payload = JSON.stringify(data);

  for (const [ws, state] of clients.entries()) {
    if (ws.readyState === WebSocket.OPEN && Number(state.userId) === Number(userId)) {
      try {
        ws.send(payload);
      } catch {
        clients.delete(ws);
      }
    }
  }
}

/** Helper to update a user's wallet across all their open browser tabs instantly */
function broadcastBalance(userId, balance) {
  sendToUser(userId, {
    type: 'BALANCE_UPDATE',
    balance: Number(balance),
    timestamp: Date.now(),
  });
}

/** High-frequency (50ms) flight sync loop for zero-lag multiplier display */
function startAviatorBroadcastLoop() {
  setInterval(async () => {
    try {
      if (!wss || clients.size === 0) return;

      const flyingRes = await pool.query(
        `SELECT r.id AS "roundId", r.status, r.scheduled_result AS "scheduledResult",
                r.flying_started_at AS "flyingStartedAt",
                EXTRACT(EPOCH FROM (NOW() - r.flying_started_at))::FLOAT AS "flightElapsed"
         FROM game_rounds r
         WHERE r.game_id = 'aviator' AND r.status = 'closed'
         ORDER BY r.closed_at DESC LIMIT 1`
      );

      if (flyingRes.rows[0]) {
        const round = flyingRes.rows[0];
        const elapsed = Math.max(0, Number(round.flightElapsed || 0));
        const liveMult = multiplierAtElapsed(elapsed);
        const crash = Number(round.scheduledResult) || 1.5;

        broadcastAviator({
          type: 'AVIATOR_FLIGHT_TICK',
          roundId: Number(round.roundId),
          phase: 'flying',
          multiplier: liveMult,
          flightElapsed: elapsed,
          crashPoint: crash,
          timestamp: Date.now(),
        });
      }
    } catch {
      // Ignore transient query errors in loop
    }
  }, 50);
}

module.exports = {
  initWebSocketServer,
  broadcast,
  broadcastAviator,
  broadcastGame,
  broadcastPlatform,
  sendToUser,
  broadcastBalance,
};
