const https = require('https');
const http = require('http');

/**
 * Self-Pinger / Keep-Alive Worker for Render / Cloud Hosting
 * Prevents Free-Tier instances from spinning down after 15 minutes of inactivity
 * and eliminates the 50-second cold-start delay.
 */
function startKeepAliveService() {
  const targetUrl = process.env.RENDER_EXTERNAL_URL || process.env.KEEP_ALIVE_URL;
  if (!targetUrl) {
    // In local development or when no public URL is set, keep-alive is not needed
    return;
  }

  const PING_INTERVAL_MS = 8 * 60 * 1000; // Ping every 8 minutes (Render sleeps at 15 mins)
  const healthEndpoint = targetUrl.endsWith('/') ? `${targetUrl}health` : `${targetUrl}/health`;

  console.log(`[Keep-Alive] Initialized self-ping service for: ${healthEndpoint} (every 8 mins)`);

  const doPing = () => {
    try {
      const client = healthEndpoint.startsWith('https') ? https : http;
      const req = client.get(healthEndpoint, { timeout: 10000 }, (res) => {
        if (res.statusCode >= 200 && res.statusCode < 400) {
          // Healthy keep-alive response
        } else {
          console.warn(`[Keep-Alive] Ping returned status ${res.statusCode}`);
        }
      });

      req.on('error', (err) => {
        console.warn(`[Keep-Alive] Ping error (server may be starting):`, err.message);
      });

      req.on('timeout', () => {
        req.destroy();
      });
    } catch (e) {
      console.warn(`[Keep-Alive] Ping exception:`, e.message);
    }
  };

  // Run initial ping after 2 minutes, then every 8 minutes
  setTimeout(doPing, 2 * 60 * 1000);
  setInterval(doPing, PING_INTERVAL_MS);
}

module.exports = { startKeepAliveService };
