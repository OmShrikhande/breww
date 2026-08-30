import React, { useState, useEffect, useCallback } from 'react';
import apiService from '../../configs/service';
import API_ENDPOINTS from '../../configs/api';
import { formatCurrency, formatNumber } from '../games/gamesConfig';
import { formatChange } from '../../utils/mappers';
import './DashboardPage.css';

const STAT_META = [
  { key: 'totalRevenue', label: 'Total Revenue', icon: '💰', color: 'var(--gold)', format: (v) => formatCurrency(Number(v) || 0) },
  { key: 'activePlayers', label: 'Active Players', icon: '👥', color: 'var(--blue)', format: (v) => formatNumber(Number(v) || 0) },
  { key: 'betsToday', label: 'Total Bets Today', icon: '🎰', color: 'var(--purple)', format: (v) => formatNumber(Number(v) || 0) },
  { key: 'avgWinRate', label: 'Avg Win Rate', icon: '📈', color: 'var(--green)', format: (v) => `${Number(v) || 0}%` },
  { key: 'gamesOnline', label: 'Games Online', icon: '🎮', color: 'var(--orange)', format: (v) => String(v ?? '—') },
  { key: 'pendingIssues', label: 'Pending Issues', icon: '⚠️', color: 'var(--red)', format: (v) => String(v ?? 0) },
];

const TopGame = ({ game, rank, maxRevenue }) => (
  <div className="top-game-row">
    <span className={`top-game-rank rank-${rank}`}>{rank}</span>
    <span className="top-game-icon">{game.icon}</span>
    <div className="top-game-info">
      <span className="top-game-name">{game.name}</span>
      <div className="top-game-bar-wrap">
        <div
          className="top-game-bar"
          style={{
            width: `${maxRevenue ? (Number(game.revenueToday) / maxRevenue) * 100 : 0}%`,
            background: game.accentColor,
          }}
        />
      </div>
    </div>
    <span className="top-game-rev">{formatCurrency(Number(game.revenueToday) || 0)}</span>
  </div>
);

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [weekly, setWeekly] = useState([]);
  const [topGames, setTopGames] = useState([]);
  const [activity, setActivity] = useState([]);
  const [gameStatus, setGameStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setError('');
      const [statsRes, weeklyRes, topRes, activityRes, statusRes] = await Promise.all([
        apiService.get(API_ENDPOINTS.DASHBOARD_STATS),
        apiService.get(API_ENDPOINTS.DASHBOARD_WEEKLY),
        apiService.get(API_ENDPOINTS.DASHBOARD_TOP_GAMES),
        apiService.get(API_ENDPOINTS.DASHBOARD_ACTIVITY),
        apiService.get(API_ENDPOINTS.DASHBOARD_GAME_STATUS),
      ]);
      setStats(statsRes.data || null);
      setWeekly(weeklyRes.data || []);
      setTopGames(topRes.data || []);
      setActivity(activityRes.data || []);
      setGameStatus(statusRes.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [load]);

  const barMax = Math.max(...weekly.map((d) => Number(d.revenue) || 0), 1);
  const topMax = Math.max(...topGames.map((g) => Number(g.revenueToday) || 0), 1);
  const onlineGames = gameStatus.filter((g) => g.status === 'active').length;
  const weeklyTotal = weekly.reduce((a, b) => a + (Number(b.revenue) || 0), 0);

  if (loading) {
    return <div className="dash-page"><p className="dash-card-sub">Loading dashboard…</p></div>;
  }

  if (error) {
    return (
      <div className="dash-page">
        <div className="dash-card">
          <p className="dash-card-sub">{error}</p>
          <button className="global-ctrl-btn global-ctrl-btn--enable" onClick={load}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="dash-page">
      <div className="dash-stats-grid">
        {STAT_META.map((s) => {
          const change = formatChange(stats?.changes?.[s.key]);
          const up = !String(change).trim().startsWith('-');
          return (
            <div key={s.key} className="dash-stat-card" style={{ '--c': s.color }}>
              <div className="dash-stat-icon">{s.icon}</div>
              <div className="dash-stat-content">
                <span className="dash-stat-val">{s.format(stats?.[s.key])}</span>
                <span className="dash-stat-lbl">{s.label}</span>
                <span className={`dash-stat-change ${up ? 'up' : 'down'}`}>
                  {up ? '▲' : '▼'} {change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="dash-main-grid">
        <section className="dash-card dash-revenue-chart">
          <div className="dash-card-header">
            <div>
              <h3 className="dash-card-title">Weekly Revenue</h3>
              <p className="dash-card-sub">Last 7 days performance</p>
            </div>
            <span className="dash-card-badge">{formatCurrency(weeklyTotal)} total</span>
          </div>
          <div className="revenue-chart">
            {weekly.map((d, i) => (
              <div key={i} className="rev-bar-col">
                <div
                  className="rev-bar"
                  style={{ height: `${((Number(d.revenue) || 0) / barMax) * 100}%` }}
                  title={`${d.day}: ${formatCurrency(Number(d.revenue) || 0)}`}
                >
                  <span className="rev-bar-tooltip">{formatCurrency(Number(d.revenue) || 0)}</span>
                </div>
                <span className="rev-bar-label">{d.day}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="dash-card dash-top-games">
          <div className="dash-card-header">
            <div>
              <h3 className="dash-card-title">Top Games</h3>
              <p className="dash-card-sub">By revenue today</p>
            </div>
          </div>
          <div className="top-games-list">
            {topGames.slice(0, 6).map((g, i) => (
              <TopGame key={g.id} game={g} rank={i + 1} maxRevenue={topMax} />
            ))}
            {topGames.length === 0 && <p className="dash-card-sub">No game data yet</p>}
          </div>
        </section>
      </div>

      <div className="dash-lower-grid">
        <section className="dash-card dash-activity">
          <div className="dash-card-header">
            <div>
              <h3 className="dash-card-title">Live Activity</h3>
              <p className="dash-card-sub">Real-time game events</p>
            </div>
            <span className="live-indicator"><span className="live-dot" />Live</span>
          </div>
          <div className="activity-feed">
            {activity.map((a, i) => (
              <div key={i} className={`activity-item activity-item--${a.type || 'game'}`}>
                <div className="activity-game-icon">{a.icon || '🎮'}</div>
                <div className="activity-body">
                  <p className="activity-action">{a.action}</p>
                  <span className="activity-meta">{a.game} · {a.time}</span>
                </div>
                {a.amount != null && a.amount !== '' && (
                  <span className={`activity-amount ${String(a.amount).startsWith('+') || Number(a.amount) > 0 ? 'amount-win' : 'amount-loss'}`}>
                    {typeof a.amount === 'number' ? formatCurrency(a.amount) : a.amount}
                  </span>
                )}
              </div>
            ))}
            {activity.length === 0 && <p className="dash-card-sub">No recent activity</p>}
          </div>
        </section>

        <section className="dash-card dash-game-status">
          <div className="dash-card-header">
            <div>
              <h3 className="dash-card-title">Game Status</h3>
              <p className="dash-card-sub">{onlineGames} of {gameStatus.length} online</p>
            </div>
          </div>
          <div className="game-status-list">
            {gameStatus.map((g) => (
              <div key={g.id} className="game-status-row">
                <span className="gs-icon">{g.icon}</span>
                <span className="gs-name">{g.name}</span>
                <div className="gs-players">
                  <span
                    className="gs-online-dot"
                    style={{
                      background:
                        g.status === 'active' ? 'var(--green)'
                          : g.status === 'maintenance' ? 'var(--gold)' : 'var(--red)',
                    }}
                  />
                  {formatNumber(Number(g.playersOnline) || 0)}
                </div>
                <span className={`badge badge-${g.status === 'active' ? 'active' : g.status === 'maintenance' ? 'maintenance' : 'inactive'}`}>
                  {g.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default DashboardPage;
