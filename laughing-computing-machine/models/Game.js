const pool = require('../config/database');

class Game {
  static async findAll() {
    const { rows } = await pool.query(`
      SELECT
        g.id, g.name, g.category, g.icon, g.tagline, g.accent_color AS "accentColor",
        g.gradient, g.status,
        gs.enabled, gs.maintenance_mode AS "maintenanceMode", gs.manual_result_mode AS "manualResultMode",
        gs.auto_result_interval AS "autoResultInterval", gs.min_bet AS "minBet",
        gs.max_bet AS "maxBet", gs.house_edge AS "houseEdge", gs.rtp, gs.commission_rate AS "commissionRate",
        gs.extra_config AS "extraConfig",
        COALESCE(sd.players_online,0) AS "playersOnline",
        COALESCE(sd.bets_count,0) AS "betsCount",
        COALESCE(sd.revenue,0) AS revenue,
        COALESCE(sd.win_rate,0) AS "winRate"
      FROM platform_games g
      LEFT JOIN game_settings gs ON gs.game_id = g.id
      LEFT JOIN game_stats_daily sd ON sd.game_id = g.id AND sd."date" = CURRENT_DATE
      ORDER BY g.name
    `);
    return rows.map(r => ({
      id: r.id, name: r.name, category: r.category, icon: r.icon,
      tagline: r.tagline, accentColor: r.accentColor, gradient: r.gradient,
      status: r.status,
      stats: { playersOnline: r.playersOnline, betsCount: r.betsCount, revenue: r.revenue, winRate: r.winRate },
      settings: {
        enabled: r.enabled, maintenanceMode: r.maintenanceMode, manualResultMode: r.manualResultMode,
        autoResultInterval: r.autoResultInterval, minBet: r.minBet, maxBet: r.maxBet,
        houseEdge: r.houseEdge, rtp: r.rtp, commissionRate: r.commissionRate, extraConfig: r.extraConfig
      }
    }));
  }

  static async findById(id) {
    const { rows } = await pool.query(`
      SELECT
        g.id, g.name, g.category, g.icon, g.tagline, g.accent_color AS "accentColor",
        g.gradient, g.status,
        gs.enabled, gs.maintenance_mode AS "maintenanceMode", gs.manual_result_mode AS "manualResultMode",
        gs.auto_result_interval AS "autoResultInterval", gs.min_bet AS "minBet",
        gs.max_bet AS "maxBet", gs.house_edge AS "houseEdge", gs.rtp, gs.commission_rate AS "commissionRate",
        gs.extra_config AS "extraConfig",
        COALESCE(sd.players_online,0) AS "playersOnline",
        COALESCE(sd.bets_count,0) AS "betsCount",
        COALESCE(sd.revenue,0) AS revenue,
        COALESCE(sd.win_rate,0) AS "winRate"
      FROM platform_games g
      LEFT JOIN game_settings gs ON gs.game_id = g.id
      LEFT JOIN game_stats_daily sd ON sd.game_id = g.id AND sd."date" = CURRENT_DATE
      WHERE g.id = $1
    `, [id]);
    if (!rows[0]) return null;
    const r = rows[0];
    return {
      id: r.id, name: r.name, category: r.category, icon: r.icon,
      tagline: r.tagline, accentColor: r.accentColor, gradient: r.gradient,
      status: r.status,
      stats: { playersOnline: r.playersOnline, betsCount: r.betsCount, revenue: r.revenue, winRate: r.winRate },
      settings: {
        enabled: r.enabled, maintenanceMode: r.maintenanceMode, manualResultMode: r.manualResultMode,
        autoResultInterval: r.autoResultInterval, minBet: r.minBet, maxBet: r.maxBet,
        houseEdge: r.houseEdge, rtp: r.rtp, commissionRate: r.commissionRate, extraConfig: r.extraConfig
      }
    };
  }

  static async updateSettings(id, settings) {
    const fields = ['enabled','maintenance_mode','manual_result_mode','auto_result_interval','min_bet','max_bet','house_edge','rtp','commission_rate','extra_config'];
    const map = {
      enabled: settings.enabled, maintenance_mode: settings.maintenanceMode,
      manual_result_mode: settings.manualResultMode, auto_result_interval: settings.autoResultInterval,
      min_bet: settings.minBet, max_bet: settings.maxBet, house_edge: settings.houseEdge,
      rtp: settings.rtp, commission_rate: settings.commissionRate, extra_config: settings.extraConfig
    };

    const updates = [];
    const values = [];
    let p = 1;
    for (const f of fields) {
      if (map[f] !== undefined) {
        updates.push(`${f} = $${p}`);
        values.push(f === 'extra_config' ? JSON.stringify(map[f]) : map[f]);
        p++;
      }
    }
    if (updates.length === 0) return null;
    updates.push(`updated_at = NOW()`);
    values.push(id);
    const { rows } = await pool.query(
      `UPDATE game_settings SET ${updates.join(',')} WHERE game_id = $${p} RETURNING *`,
      values
    );
    return rows[0];
  }

  static async updateStatus(id, status) {
    const enabled = status === 'active';
    const maintenanceMode = status === 'maintenance';
    await pool.query(`UPDATE game_settings SET enabled = $1, maintenance_mode = $2, updated_at = NOW() WHERE game_id = $3`, [enabled, maintenanceMode, id]);
    const { rows } = await pool.query(
      `UPDATE platform_games SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING id, status`,
      [status, id]
    );
    return { ...rows[0], settings: { enabled, maintenanceMode } };
  }

  static async bulkStatus(action) {
    const status = action === 'enable' ? 'active' : action === 'disable' ? 'inactive' : 'maintenance';
    const enabled = action === 'enable';
    const maintenanceMode = action === 'maintenance';
    await pool.query(`UPDATE platform_games SET status = $1, updated_at = NOW()`, [status]);
    await pool.query(`UPDATE game_settings SET enabled = $1, maintenance_mode = $2, updated_at = NOW()`, [enabled, maintenanceMode]);
    const { rows } = await pool.query(`SELECT id, status FROM platform_games`);
    return rows;
  }

  static async getForDashboard() {
    const { rows } = await pool.query(`
      SELECT g.id, g.name, g.icon, g.status, g.accent_color AS "accentColor",
             COALESCE(sd.players_online,0) AS "playersOnline",
             COALESCE(sd.revenue,0) AS "revenueToday"
      FROM platform_games g
      LEFT JOIN game_stats_daily sd ON sd.game_id = g.id AND sd."date" = CURRENT_DATE
      ORDER BY sd.revenue DESC NULLS LAST
    `);
    return rows;
  }
}

module.exports = Game;
