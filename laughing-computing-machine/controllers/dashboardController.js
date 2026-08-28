const pool = require('../config/database');
const Game = require('../models/Game');

const getStats = async (req, res) => {
  try {
    const [rev, players, betsToday, games, pending] = await Promise.all([
      pool.query(`SELECT COALESCE(SUM(revenue),0) AS total, COALESCE(SUM(revenue) FILTER (WHERE date = CURRENT_DATE - 1),0) AS yesterday FROM game_stats_daily`),
      pool.query(`SELECT COALESCE(SUM(players_online),0) AS total FROM game_stats_daily WHERE date = CURRENT_DATE`),
      pool.query(`SELECT COALESCE(SUM(bets_count),0) AS total FROM game_stats_daily WHERE date = CURRENT_DATE`),
      pool.query(`SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='active') AS online FROM platform_games`),
      pool.query(`SELECT COUNT(*) AS total FROM transactions WHERE status='pending' AND type='withdrawal'`)
    ]);

    res.json({
      success: true,
      data: {
        totalRevenue: parseFloat(rev.rows[0].total),
        activePlayers: parseInt(players.rows[0].total),
        betsToday: parseInt(betsToday.rows[0].total),
        avgWinRate: 47.3,
        gamesOnline: parseInt(games.rows[0].online),
        pendingIssues: parseInt(pending.rows[0].total),
        changes: {
          totalRevenue: '+12.5%',
          activePlayers: '+8.2%',
          betsToday: '+5.1%',
          avgWinRate: '-1.2%',
          gamesOnline: '0%',
          pendingIssues: '+2'
        }
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const weeklyRevenue = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT TO_CHAR(d::date, 'Dy') AS day,
             COALESCE(SUM(s.revenue), 0) AS revenue,
             COALESCE(SUM(s.bets_count), 0) AS bets
      FROM generate_series(NOW() - '6 days'::INTERVAL, NOW(), '1 day') d
      LEFT JOIN game_stats_daily s ON s.date = d::date
      GROUP BY d ORDER BY d
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Weekly revenue error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const topGames = async (req, res) => {
  try {
    const games = await Game.getForDashboard();
    res.json({ success: true, data: games.slice(0, 5) });
  } catch (error) {
    console.error('Top games error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const liveActivity = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT al.type, pg.name AS game, al.action, al.amount,
             al.created_at AS time
      FROM activity_log al
      LEFT JOIN platform_games pg ON pg.id = al.game_id
      ORDER BY al.created_at DESC LIMIT 20
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Live activity error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const gameStatus = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT g.id, g.name, g.icon, g.status,
             COALESCE(sd.players_online, 0) AS "playersOnline"
      FROM platform_games g
      LEFT JOIN game_stats_daily sd ON sd.game_id = g.id AND sd.date = CURRENT_DATE
      ORDER BY g.name
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Game status error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { getStats, weeklyRevenue, topGames, liveActivity, gameStatus };
