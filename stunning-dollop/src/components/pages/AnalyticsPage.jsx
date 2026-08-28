import React, { useState, useEffect, useCallback } from 'react';
import { formatCurrency, formatNumber } from '../games/gamesConfig';
import apiService from '../../configs/service';
import API_ENDPOINTS from '../../configs/api';
import './AnalyticsPage.css';

const MiniBarChart = ({ data, valueKey, color, height = 120 }) => {
  const max = Math.max(...data.map((d) => Number(d[valueKey]) || 0), 1);
  return (
    <div className="mini-chart" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="mini-bar-col" title={`${d.label}: ${Number(d[valueKey] || 0).toLocaleString()}`}>
          <div className="mini-bar" style={{ height: `${((Number(d[valueKey]) || 0) / max) * 90}%`, background: color || 'var(--gold)' }} />
          {data.length <= 10 && <span className="mini-bar-lbl">{d.label}</span>}
        </div>
      ))}
    </div>
  );
};

const HeatmapRow = ({ label, values }) => (
  <div className="heatmap-row">
    <span className="heatmap-lbl">{label}</span>
    {values.map((v, i) => (
      <div
        key={i}
        className="heatmap-cell"
        style={{ opacity: 0.15 + (Number(v) / 100) * 0.85, background: 'var(--gold)' }}
        title={`${v}%`}
      />
    ))}
  </div>
);

const AnalyticsPage = () => {
  const [period, setPeriod] = useState('7d');
  const [metric, setMetric] = useState('revenue');
  const [series, setSeries] = useState([]);
  const [gameShare, setGameShare] = useState([]);
  const [peakHours, setPeakHours] = useState([]);
  const [heatmap, setHeatmap] = useState({ days: [], hours: [], matrix: [] });
  const [winLoss, setWinLoss] = useState([]);
  const [quick, setQuick] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setError('');
      const q = `?period=${period}`;
      const [rev, bets, sessions, share, peak, heat, wl, qm] = await Promise.all([
        apiService.get(`${API_ENDPOINTS.ANALYTICS_REVENUE}${q}`),
        apiService.get(`${API_ENDPOINTS.ANALYTICS_BETS}${q}`),
        apiService.get(`${API_ENDPOINTS.ANALYTICS_SESSIONS}${q}`),
        apiService.get(API_ENDPOINTS.ANALYTICS_GAME_SHARE),
        apiService.get(API_ENDPOINTS.ANALYTICS_PEAK_HOURS),
        apiService.get(API_ENDPOINTS.ANALYTICS_HEATMAP),
        apiService.get(API_ENDPOINTS.ANALYTICS_WIN_LOSS),
        apiService.get(API_ENDPOINTS.ANALYTICS_QUICK),
      ]);

      const revRows = rev.data || [];
      const betRows = bets.data || [];
      const sessRows = sessions.data || [];
      const merged = revRows.map((r, i) => ({
        label: r.label,
        revenue: Number(r.revenue) || 0,
        bets: Number(betRows[i]?.bets) || 0,
        users: Number(sessRows[i]?.users) || 0,
      }));

      setSeries(merged);
      setGameShare((share.data || []).map((g) => ({
        ...g,
        share: Number(g.share) || 0,
        revenue: Number(g.revenue) || 0,
      })));
      setPeakHours((peak.data || []).map((h) => ({
        h: String(h.hour ?? h.h ?? ''),
        val: Number(h.activityPct ?? h.val ?? 0),
      })));
      setHeatmap(heat.data || { days: [], hours: [], matrix: [] });
      setWinLoss(wl.data || []);
      setQuick(qm.data || null);
    } catch (err) {
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  const totalRev = series.reduce((a, b) => a + b.revenue, 0);
  const totalBets = series.reduce((a, b) => a + b.bets, 0);
  const totalUsers = series.reduce((a, b) => a + b.users, 0);
  const avgRev = series.length ? totalRev / series.length : 0;
  const metricColors = { revenue: 'var(--gold)', bets: 'var(--blue)', users: 'var(--purple)' };
  const metricKey = metric === 'users' ? 'users' : metric;

  if (loading) return <div className="analytics-page"><p>Loading analytics…</p></div>;

  return (
    <div className="analytics-page">
      {error && <p style={{ color: 'var(--red)' }}>{error}</p>}

      <div className="analytics-kpis">
        {[
          { lbl: 'Total Revenue', val: formatCurrency(totalRev), icon: '💰', c: 'var(--gold)' },
          { lbl: 'Total Bets', val: formatNumber(totalBets), icon: '🎰', c: 'var(--blue)' },
          { lbl: 'Total Sessions', val: formatNumber(totalUsers), icon: '👥', c: 'var(--purple)' },
          { lbl: 'Avg Daily Rev', val: formatCurrency(avgRev), icon: '📈', c: 'var(--green)' },
          { lbl: 'Period', val: period === '7d' ? '7 Days' : '30 Days', icon: '📅', c: 'var(--orange)' },
        ].map((k, i) => (
          <div key={i} className="analytics-kpi" style={{ '--c': k.c }}>
            <span className="akpi-icon">{k.icon}</span>
            <span className="akpi-val">{k.val}</span>
            <span className="akpi-lbl">{k.lbl}</span>
          </div>
        ))}
      </div>

      <div className="analytics-main-chart-card">
        <div className="chart-card-header">
          <div>
            <h3 className="dash-card-title">Performance Overview</h3>
            <p className="dash-card-sub">Track revenue, bets and user activity over time</p>
          </div>
          <div className="chart-controls">
            <div className="metric-picker">
              {['revenue', 'bets', 'users'].map((m) => (
                <button
                  key={m}
                  className={`metric-btn ${metric === m ? 'metric-btn--active' : ''}`}
                  style={metric === m ? { color: metricColors[m], borderColor: metricColors[m] } : {}}
                  onClick={() => setMetric(m)}
                >
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>
            <div className="period-picker">
              <button className={`period-btn ${period === '7d' ? 'period-btn--active' : ''}`} onClick={() => setPeriod('7d')}>7D</button>
              <button className={`period-btn ${period === '30d' ? 'period-btn--active' : ''}`} onClick={() => setPeriod('30d')}>30D</button>
            </div>
          </div>
        </div>
        <MiniBarChart data={series} valueKey={metricKey} color={metricColors[metric]} height={200} />
      </div>

      <div className="analytics-mid-grid">
        <div className="analytics-card">
          <div className="dash-card-header">
            <div>
              <h3 className="dash-card-title">Revenue by Game</h3>
              <p className="dash-card-sub">Market share today</p>
            </div>
          </div>
          <div className="game-share-list">
            {gameShare.map((g, i) => (
              <div key={g.id} className="game-share-row">
                <span className="gs-rank-num">{i + 1}</span>
                <span className="gs-icon">{g.icon}</span>
                <div className="gs-info">
                  <div className="gs-name-row">
                    <span className="gs-name">{g.name}</span>
                    <span className="gs-pct">{Number(g.share).toFixed(1)}%</span>
                  </div>
                  <div className="gs-bar-track">
                    <div className="gs-bar-fill" style={{ width: `${g.share}%`, background: g.accentColor }} />
                  </div>
                </div>
                <span className="gs-rev-val">{formatCurrency(g.revenue)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="analytics-card">
          <div className="dash-card-header">
            <div>
              <h3 className="dash-card-title">Peak Hours</h3>
              <p className="dash-card-sub">Player activity by hour (% of peak)</p>
            </div>
          </div>
          <div className="peak-chart">
            {peakHours.filter((_, i) => i % 2 === 0).map((h, i) => (
              <div key={i} className="peak-col">
                <div
                  className="peak-bar"
                  style={{
                    height: `${h.val}%`,
                    background: h.val > 70 ? 'var(--gold)' : h.val > 40 ? 'var(--orange)' : 'var(--blue)',
                  }}
                />
                <span className="peak-label">{h.h}h</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="analytics-card">
        <div className="dash-card-header">
          <div>
            <h3 className="dash-card-title">Activity Heatmap</h3>
            <p className="dash-card-sub">Player activity intensity by day and hour</p>
          </div>
        </div>
        <div className="heatmap-wrap">
          <div className="heatmap-hours">
            {(heatmap.hours?.length ? heatmap.hours : Array.from({ length: 12 }, (_, i) => i * 2)).map((h, i) => (
              <span key={i}>{String(h).padStart(2, '0')}h</span>
            ))}
          </div>
          {(heatmap.days || []).map((day, di) => (
            <HeatmapRow key={day} label={day} values={heatmap.matrix?.[di] || []} />
          ))}
          <div className="heatmap-legend">
            <span>Low</span>
            <div className="heatmap-gradient" />
            <span>High</span>
          </div>
        </div>
      </div>

      <div className="analytics-bottom-grid">
        <div className="analytics-card">
          <div className="dash-card-header">
            <h3 className="dash-card-title">Win / Loss Ratio by Game</h3>
          </div>
          <div className="winloss-list">
            {winLoss.map((g) => (
              <div key={g.id} className="winloss-row">
                <span className="wl-icon">{g.icon}</span>
                <span className="wl-name">{g.name}</span>
                <div className="wl-bar-wrap">
                  <div className="wl-bar-win" style={{ width: `${Number(g.winRate) || 0}%` }} />
                  <div className="wl-bar-loss" style={{ width: `${Number(g.lossRate) || (100 - (Number(g.winRate) || 0))}%` }} />
                </div>
                <span className="wl-rate">
                  <span className="wl-win">{Number(g.winRate) || 0}%</span>
                  {' / '}
                  <span className="wl-loss">{Number(g.lossRate) || (100 - (Number(g.winRate) || 0)).toFixed(1)}%</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="analytics-card">
          <div className="dash-card-header">
            <h3 className="dash-card-title">Quick Metrics</h3>
          </div>
          <div className="quick-metrics-grid">
            {[
              { l: 'Avg Session Duration', v: quick?.avgSession ?? '—', icon: '⏱' },
              { l: 'Bounce Rate', v: quick?.bounceRate ?? '—', icon: '↩' },
              { l: 'Avg Bets per User', v: quick?.betsPerUser ?? '—', icon: '🎯' },
              { l: 'Conversion Rate', v: quick?.conversionRate ?? '—', icon: '📊' },
              { l: 'Revenue per User', v: quick?.revenuePerUser != null ? formatCurrency(Number(quick.revenuePerUser) || 0) : '—', icon: '💵' },
              { l: 'Churn Rate (7d)', v: quick?.churnRate ?? '—', icon: '📉' },
            ].map((m, i) => (
              <div key={i} className="qm-card">
                <span className="qm-icon">{m.icon}</span>
                <span className="qm-val">{m.v}</span>
                <span className="qm-lbl">{m.l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
