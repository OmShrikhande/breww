import React, { useState, useEffect, useRef, useCallback } from 'react';
import apiService from '../../configs/service';
import API_ENDPOINTS from '../../configs/api';
import { useAuth } from '../../contexts/AuthContext';
import './GameControlPage.css';

const GAME_OPTIONS = {
  colour: [
    { id: 'red',    label: 'Red',    icon: '🔴', color: '#DC143C', bg: 'rgba(220,20,60,0.15)',    multiplier: '2x' },
    { id: 'green',  label: 'Green',  icon: '🟢', color: '#22c55e', bg: 'rgba(34,197,94,0.15)',    multiplier: '2x' },
    { id: 'violet', label: 'Violet', icon: '🟣', color: '#a855f7', bg: 'rgba(168,85,247,0.15)',   multiplier: '4.5x' },
  ],
  'dragon-tiger': [
    { id: 'dragon', label: 'Dragon', icon: '🐉', color: '#DC143C', bg: 'rgba(220,20,60,0.15)',    multiplier: '1.95x' },
    { id: 'tiger',  label: 'Tiger',  icon: '🐅', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)',   multiplier: '1.95x' },
    { id: 'tie',    label: 'Tie',    icon: '⚖️', color: '#6366f1', bg: 'rgba(99,102,241,0.15)',   multiplier: '8x' },
  ],
  'andar-bahar': [
    { id: 'andar', label: 'Andar', icon: '⬅️', color: '#4f8ef7', bg: 'rgba(79,142,247,0.15)',  multiplier: '1.9x' },
    { id: 'bahar', label: 'Bahar', icon: '➡️', color: '#f97316', bg: 'rgba(249,115,22,0.15)',  multiplier: '2x' },
  ],
  wheel: Array.from({ length: 10 }, (_, i) => ({
    id:          String(i + 1),
    label:       `Seg ${i + 1}`,
    icon:        ['🟥','🟨','🟩','🟦','🟪','🟧','🟫','⬛','⬜','🔶'][i],
    color:       ['#DC143C','#FFD700','#22c55e','#4f8ef7','#a855f7','#f97316','#a16207','#334155','#94a3b8','#f59e0b'][i],
    bg:          ['rgba(220,20,60,0.15)','rgba(255,215,0,0.15)','rgba(34,197,94,0.15)','rgba(79,142,247,0.15)',
                  'rgba(168,85,247,0.15)','rgba(249,115,22,0.15)','rgba(161,98,7,0.15)','rgba(51,65,85,0.15)',
                  'rgba(148,163,184,0.15)','rgba(245,158,11,0.15)'][i],
    multiplier:  ['20x','5x','3x','2x','1.5x','1.5x','2x','3x','5x','20x'][i],
  })),
  dice: [
    { id: '1', label: '1', icon: '⚀', color: '#4f8ef7', bg: 'rgba(79,142,247,0.15)',   multiplier: '5.8x' },
    { id: '2', label: '2', icon: '⚁', color: '#22c55e', bg: 'rgba(34,197,94,0.15)',    multiplier: '5.8x' },
    { id: '3', label: '3', icon: '⚂', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)',   multiplier: '5.8x' },
    { id: '4', label: '4', icon: '⚃', color: '#f97316', bg: 'rgba(249,115,22,0.15)',   multiplier: '5.8x' },
    { id: '5', label: '5', icon: '⚄', color: '#a855f7', bg: 'rgba(168,85,247,0.15)',   multiplier: '5.8x' },
    { id: '6', label: '6', icon: '⚅', color: '#DC143C', bg: 'rgba(220,20,60,0.15)',    multiplier: '5.8x' },
  ],
  plinko: [
    { id: '0', label: '1000x', icon: '💎', color: '#FFD700', bg: 'rgba(255,215,0,0.2)',   multiplier: '1000x' },
    { id: '1', label: '50x',   icon: '🥇', color: '#f97316', bg: 'rgba(249,115,22,0.15)', multiplier: '50x' },
    { id: '2', label: '10x',   icon: '🥈', color: '#22c55e', bg: 'rgba(34,197,94,0.15)',  multiplier: '10x' },
    { id: '3', label: '2x',    icon: '🥉', color: '#4f8ef7', bg: 'rgba(79,142,247,0.15)', multiplier: '2x' },
    { id: '4', label: '2x',    icon: '🥉', color: '#4f8ef7', bg: 'rgba(79,142,247,0.15)', multiplier: '2x' },
    { id: '5', label: '10x',   icon: '🥈', color: '#22c55e', bg: 'rgba(34,197,94,0.15)',  multiplier: '10x' },
    { id: '6', label: '50x',   icon: '🥇', color: '#f97316', bg: 'rgba(249,115,22,0.15)', multiplier: '50x' },
    { id: '7', label: '1000x', icon: '💎', color: '#FFD700', bg: 'rgba(255,215,0,0.2)',   multiplier: '1000x' },
  ],
};

const AVIATOR_PRESETS = [
  { label: '1.5x',  value: 1.5 },
  { label: '2x',    value: 2.0 },
  { label: '3x',    value: 3.0 },
  { label: '5x',    value: 5.0 },
  { label: '10x',   value: 10.0 },
  { label: '20x',   value: 20.0 },
];

const formatINR = (amount) => {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000)   return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000)     return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount}`;
};

const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

const genBets = (ids) => {
  const bets = {};
  ids.forEach(id => { bets[id] = 0; });
  return bets;
};

const GameControlPage = ({ game, onBack }) => {
  const { canWrite } = useAuth();
  const options   = GAME_OPTIONS[game.id]
    || (game.id === 'dragon' ? GAME_OPTIONS['dragon-tiger'] : null)
    || (game.id === 'wheel' || game.id === 'spin-wheel' ? GAME_OPTIONS.wheel : null)
    || [];
  const isAviator = game.id === 'aviator';
  const isMines   = game.id === 'mines';

  const [bets,          setBets]          = useState(() => genBets(options.map(o => o.id)));
  const [roundTimer,    setRoundTimer]    = useState(game.settings.roundDuration || game.settings.autoResultInterval || 60);
  const [roundId,       setRoundId]       = useState(null);
  const [roundStatus,   setRoundStatus]   = useState('betting');
  const [selectedResult, setSelectedResult] = useState(null);
  const [crashPoint,    setCrashPoint]    = useState(2.0);
  const [declaredResult, setDeclaredResult] = useState(null);
  const [history,       setHistory]       = useState([]);
  const [confirmMode,   setConfirmMode]   = useState(false);
  const [liveCount,     setLiveCount]     = useState(game.stats.playersOnline);
  const [notification,  setNotification]  = useState(null);
  const timerRef = useRef(null);

  const totalPot   = Object.values(bets).reduce((a, b) => a + b, 0);
  const maxBetVal  = Math.max(...Object.values(bets), 0);
  const highestOpt = options.find(o => bets[o.id] === maxBetVal);

  const showNotif = useCallback((msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const loadRoundData = useCallback(async () => {
    if (isMines) return;
    try {
      const [currentRes, betsRes, historyRes] = await Promise.all([
        apiService.get(API_ENDPOINTS.ROUND_CURRENT(game.id)),
        apiService.get(API_ENDPOINTS.ROUND_BETS(game.id)),
        apiService.get(`${API_ENDPOINTS.ROUND_HISTORY(game.id)}?limit=12`),
      ]);

      const current = currentRes.data || {};
      if (current.roundId != null) setRoundId(current.roundId);
      if (current.timerLeft != null) setRoundTimer(Number(current.timerLeft) || 0);
      if (current.playersCount != null) setLiveCount(Number(current.playersCount) || 0);
      if (current.status) {
        const mapped =
          current.status === 'open' ? 'betting'
            : current.status === 'declared' ? 'declared'
              : current.status === 'completed' || current.status === 'closed' ? 'completed'
                : 'betting';
        setRoundStatus(mapped);
      }

      const distribution = betsRes.data?.distribution || {};
      if (Object.keys(distribution).length) {
        setBets((prev) => {
          const next = { ...prev };
          Object.entries(distribution).forEach(([k, v]) => {
            next[k] = Number(v) || 0;
          });
          return next;
        });
      }

      const hist = (historyRes.data || []).map((h) => ({
        roundId: h.roundId,
        result: h.result,
        totalPot: Number(h.totalPot) || 0,
        time: h.createdAt
          ? new Date(h.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : h.time || '—',
        adminSet: Boolean(h.adminSet),
      }));
      setHistory(hist);
    } catch (err) {
      showNotif(err.message || 'Failed to load round data', 'error');
    }
  }, [game.id, isMines, showNotif]);

  useEffect(() => {
    loadRoundData();
    const t = setInterval(loadRoundData, 5000);
    return () => clearInterval(t);
  }, [loadRoundData]);

  useEffect(() => {
    if (roundStatus !== 'betting') return;
    timerRef.current = setInterval(() => {
      setRoundTimer(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [roundStatus, roundId]);

  const startNewRound = useCallback(async () => {
    if (!canWrite) return;
    try {
      const res = await apiService.post(API_ENDPOINTS.ROUND_NEW(game.id), {});
      setRoundId(res.data?.roundId ?? null);
      setBets(genBets(options.map(o => o.id)));
      setRoundTimer(game.settings.roundDuration || game.settings.autoResultInterval || 60);
      setSelectedResult(null);
      setDeclaredResult(null);
      setRoundStatus('betting');
      setConfirmMode(false);
      showNotif('New round started', 'success');
      await loadRoundData();
    } catch (err) {
      showNotif(err.message || 'Failed to start round', 'error');
    }
  }, [canWrite, game.id, game.settings, options, showNotif, loadRoundData]);

  const handleDeclare = async () => {
    if (!canWrite) {
      showNotif('Viewer role cannot declare results', 'error');
      return;
    }
    const result = isAviator ? String(crashPoint) : selectedResult;
    if (!result) return;

    if (!confirmMode) { setConfirmMode(true); return; }

    try {
      clearInterval(timerRef.current);
      const res = await apiService.post(API_ENDPOINTS.ROUND_DECLARE(game.id), {
        result,
        roundId: roundId || undefined,
      });
      setDeclaredResult(result);
      setRoundStatus('declared');
      showNotif(
        `Result declared: ${isAviator ? result + 'x' : String(result).toUpperCase()} · payout ${res.data?.payoutTotal ?? 0}`,
        'success'
      );
      setTimeout(async () => {
        setRoundStatus('completed');
        await loadRoundData();
        setTimeout(startNewRound, 1500);
      }, 2000);
    } catch (err) {
      setConfirmMode(false);
      showNotif(err.message || 'Declare failed', 'error');
    }
  };

  const handleAutoResult = () => {
    if (!canWrite) return;
    const pick = options[Math.floor(Math.random() * options.length)];
    if (isAviator) {
      const val = parseFloat((Math.random() * 9 + 1.1).toFixed(2));
      setCrashPoint(val);
    } else if (pick) {
      setSelectedResult(pick.id);
    }
    setConfirmMode(true);
    showNotif('Auto result selected — confirm to declare', 'info');
  };

  const handleCancelDeclare = () => {
    setConfirmMode(false);
    setSelectedResult(null);
  };

  const optionForResult = (id) => options.find(o => o.id === id);

  const STATUS_CONFIG = {
    betting:   { label: 'Bets Open',   cls: 'status--betting' },
    declared:  { label: 'Declaring…',  cls: 'status--declared' },
    completed: { label: 'Round Over',  cls: 'status--completed' },
  };
  const statusCfg = STATUS_CONFIG[roundStatus] || STATUS_CONFIG.betting;

  return (
    <div className="gcp-wrap">
      {notification && (
        <div className={`gcp-notif gcp-notif--${notification.type}`}>{notification.msg}</div>
      )}

      <div className="gcp-header">
        <button className="gcp-back-btn" onClick={onBack}>
          <span className="gcp-back-arrow">←</span>
          <span>Games</span>
        </button>
        <div className="gcp-header-center">
          <div className="gcp-game-icon" style={{ background: game.gradient }}>
            {game.icon}
          </div>
          <div>
            <h1 className="gcp-title">{game.name}</h1>
            <p className="gcp-subtitle">Live Round Control Panel</p>
          </div>
        </div>
        <div className={`gcp-status-pill ${statusCfg.cls}`}>
          <span className="gcp-status-dot" />
          {statusCfg.label}
        </div>
      </div>

      <div className="gcp-round-bar">
        <div className="gcp-round-stat">
          <span className="gcp-rs-label">Round</span>
          <span className="gcp-rs-val"># {roundId}</span>
        </div>
        <div className="gcp-round-stat">
          <span className="gcp-rs-label">Timer</span>
          <span className={`gcp-rs-val gcp-timer ${roundTimer <= 10 ? 'gcp-timer--urgent' : ''}`}>
            {formatTime(roundTimer)}
          </span>
        </div>
        <div className="gcp-round-stat">
          <span className="gcp-rs-label">Total Pot</span>
          <span className="gcp-rs-val gcp-rs-pot">{formatINR(totalPot)}</span>
        </div>
        <div className="gcp-round-stat">
          <span className="gcp-rs-label">Players Betting</span>
          <span className="gcp-rs-val">{Math.max(0, liveCount).toLocaleString()}</span>
        </div>
        <div className="gcp-round-stat">
          <span className="gcp-rs-label">Manual Mode</span>
          <span className={`gcp-rs-val gcp-rs-mode ${game.settings.manualResultMode ? 'gcp-rs-mode--on' : 'gcp-rs-mode--off'}`}>
            {game.settings.manualResultMode ? 'ON' : 'OFF'}
          </span>
        </div>
      </div>

      <div className="gcp-body">
        {isMines ? (
          <div className="gcp-mines-notice">
            <span className="gcp-mines-icon">💣</span>
            <h3>Mines is Player-Driven</h3>
            <p>Mines game results depend on player choices. Each player controls their own mine field — there is no single round result to declare.</p>
          </div>
        ) : (
          <>
            <div className="gcp-section">
              <div className="gcp-section-header">
                <h2 className="gcp-section-title">Live Bet Distribution</h2>
                <div className="gcp-live-badge">
                  <span className="gcp-live-dot" />
                  Live
                </div>
              </div>

              {isAviator ? (
                <div className="gcp-aviator-bets">
                  <div className="gcp-aviator-chart">
                    <div className="gcp-avi-stat">
                      <span className="gcp-avi-val">{formatINR(totalPot)}</span>
                      <span className="gcp-avi-lbl">Total Bets In</span>
                    </div>
                    <div className="gcp-avi-stat">
                      <span className="gcp-avi-val">{liveCount.toLocaleString()}</span>
                      <span className="gcp-avi-lbl">Active Players</span>
                    </div>
                    <div className="gcp-avi-stat">
                      <span className="gcp-avi-val">{formatINR(Math.floor(totalPot / Math.max(liveCount, 1)))}</span>
                      <span className="gcp-avi-lbl">Avg Bet Size</span>
                    </div>
                    <div className="gcp-avi-stat">
                      <span className="gcp-avi-val" style={{ color: 'var(--green)' }}>
                        {formatINR(Math.floor(totalPot * (game.settings.houseEdge / 100)))}
                      </span>
                      <span className="gcp-avi-lbl">Est. House Edge</span>
                    </div>
                  </div>
                  <div className="gcp-avi-info">
                    Setting a lower crash point (e.g., 1.5x) means fewer players cash out and more bets are captured. Higher values reward players more.
                  </div>
                </div>
              ) : (
                <div className={`gcp-options-grid gcp-options-grid--${options.length > 4 ? 'many' : 'few'}`}>
                  {options.map((opt) => {
                    const betAmt  = bets[opt.id] || 0;
                    const pct     = totalPot > 0 ? (betAmt / totalPot) * 100 : 0;
                    const isMax   = opt.id === highestOpt?.id;
                    const isPick  = opt.id === selectedResult;
                    const isDeclared = opt.id === declaredResult;

                    return (
                      <div
                        key={opt.id}
                        className={`gcp-opt-card
                          ${isMax ? 'gcp-opt-card--max' : ''}
                          ${isPick ? 'gcp-opt-card--pick' : ''}
                          ${isDeclared ? 'gcp-opt-card--declared' : ''}
                          ${roundStatus === 'betting' ? 'gcp-opt-card--clickable' : ''}
                        `}
                        style={{ '--opt-color': opt.color, '--opt-bg': opt.bg }}
                        onClick={() => {
                          if (roundStatus !== 'betting') return;
                          setSelectedResult(prev => prev === opt.id ? null : opt.id);
                          setConfirmMode(false);
                        }}
                      >
                        {isMax && <div className="gcp-max-badge">🔥 Most Bets</div>}
                        {isDeclared && <div className="gcp-declared-badge">✓ Winner</div>}

                        <div className="gcp-opt-top">
                          <span className="gcp-opt-icon">{opt.icon}</span>
                          <div>
                            <div className="gcp-opt-label">{opt.label}</div>
                            <div className="gcp-opt-mult">{opt.multiplier}</div>
                          </div>
                          {isPick && !isDeclared && (
                            <div className="gcp-opt-pick-mark">✓</div>
                          )}
                        </div>

                        <div className="gcp-opt-amount">{formatINR(betAmt)}</div>

                        <div className="gcp-opt-bar-wrap">
                          <div
                            className="gcp-opt-bar"
                            style={{ width: `${pct}%`, background: opt.color }}
                          />
                        </div>

                        <div className="gcp-opt-footer">
                          <span className="gcp-opt-pct">{pct.toFixed(1)}% of pot</span>
                          <span className="gcp-opt-count">
                            ~{Math.floor(betAmt / 1500)} players
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="gcp-section gcp-declare-section">
              <div className="gcp-section-header">
                <h2 className="gcp-section-title">
                  {isAviator ? 'Set Crash Point' : 'Declare Round Result'}
                </h2>
                {!game.settings.manualResultMode && (
                  <span className="gcp-mode-warn">⚠ Enable Manual Mode for full control</span>
                )}
              </div>

              {isAviator ? (
                <div className="gcp-crash-panel">
                  <div className="gcp-crash-presets">
                    {AVIATOR_PRESETS.map(p => (
                      <button
                        key={p.value}
                        className={`gcp-crash-preset ${crashPoint === p.value ? 'gcp-crash-preset--active' : ''}`}
                        onClick={() => { setCrashPoint(p.value); setConfirmMode(false); }}
                        disabled={roundStatus !== 'betting'}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                  <div className="gcp-crash-custom">
                    <span className="gcp-crash-custom-label">Custom:</span>
                    <input
                      type="number"
                      className="gcp-crash-input"
                      value={crashPoint}
                      min={1.01}
                      max={200}
                      step={0.01}
                      onChange={e => { setCrashPoint(parseFloat(e.target.value) || 1.01); setConfirmMode(false); }}
                      disabled={roundStatus !== 'betting'}
                    />
                    <span className="gcp-crash-x">x</span>
                  </div>
                  <div className="gcp-crash-preview">
                    <span>Crash at</span>
                    <strong style={{ color: crashPoint < 2 ? 'var(--red)' : crashPoint < 5 ? 'var(--gold)' : 'var(--green)' }}>
                      {crashPoint}x
                    </strong>
                    <span>— Est. payout:</span>
                    <strong style={{ color: 'var(--green)' }}>
                      {formatINR(Math.floor(totalPot * (1 - game.settings.houseEdge / 100) / crashPoint))}
                    </strong>
                  </div>
                </div>
              ) : (
                <div className="gcp-result-chooser">
                  {selectedResult ? (
                    <div className="gcp-selected-preview" style={{ '--opt-color': optionForResult(selectedResult)?.color }}>
                      <span className="gcp-selected-icon">{optionForResult(selectedResult)?.icon}</span>
                      <div>
                        <div className="gcp-selected-label">
                          Selected: <strong>{optionForResult(selectedResult)?.label}</strong>
                        </div>
                        <div className="gcp-selected-payout">
                          Est. payout: {formatINR(Math.floor((bets[selectedResult] || 0) * parseFloat(optionForResult(selectedResult)?.multiplier || '2')))}
                          &nbsp;to winners
                        </div>
                      </div>
                      <button className="gcp-deselect-btn" onClick={handleCancelDeclare}>✕ Change</button>
                    </div>
                  ) : (
                    <div className="gcp-no-selection">
                      ← Click an option above to select the winning result
                    </div>
                  )}
                </div>
              )}

              {roundStatus === 'betting' && canWrite && (
                <div className="gcp-declare-actions">
                  {confirmMode ? (
                    <>
                      <div className="gcp-confirm-warn">
                        ⚠ Confirm: This action cannot be undone. Round result will be finalized.
                      </div>
                      <div className="gcp-confirm-btns">
                        <button className="gcp-btn gcp-btn--cancel" onClick={handleCancelDeclare}>
                          Cancel
                        </button>
                        <button
                          className="gcp-btn gcp-btn--declare"
                          onClick={handleDeclare}
                          disabled={!isAviator && !selectedResult}
                        >
                          ✓ Confirm &amp; Declare
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="gcp-action-btns">
                      <button
                        className="gcp-btn gcp-btn--auto"
                        onClick={handleAutoResult}
                      >
                        🎲 Auto Select Result
                      </button>
                      <button
                        className="gcp-btn gcp-btn--declare"
                        onClick={handleDeclare}
                        disabled={!isAviator && !selectedResult}
                      >
                        📣 Declare Result
                      </button>
                    </div>
                  )}
                </div>
              )}

              {roundStatus === 'betting' && !canWrite && (
                <div className="gcp-declare-actions">
                  <div className="gcp-confirm-warn">Viewer role — live control is read-only</div>
                </div>
              )}

              {roundStatus === 'declared' && (
                <div className="gcp-declaring-overlay">
                  <div className="gcp-declaring-spinner" />
                  <span>Finalizing result and paying out winners…</span>
                </div>
              )}

              {roundStatus === 'completed' && (
                <div className="gcp-completed-msg">
                  ✅ Round complete — starting next round…
                </div>
              )}
            </div>
          </>
        )}

        <div className="gcp-section gcp-history-section">
          <div className="gcp-section-header">
            <h2 className="gcp-section-title">Round History</h2>
            <span className="gcp-history-count">Last {history.length} rounds</span>
          </div>
          <div className="gcp-history-list">
            {history.map((h) => {
              const opt = options.find(o => o.id === h.result);
              return (
                <div key={h.roundId} className="gcp-history-row">
                  <span className="gcp-hr-round">#{h.roundId}</span>
                  <div
                    className="gcp-hr-result"
                    style={{ '--res-color': opt?.color || 'var(--text-muted)' }}
                  >
                    <span>{opt?.icon || '—'}</span>
                    <span>{opt?.label ?? h.result}</span>
                  </div>
                  <span className="gcp-hr-pot">{formatINR(h.totalPot)}</span>
                  <span className="gcp-hr-time">{h.time}</span>
                  {h.adminSet && <span className="gcp-hr-admin-badge">Admin</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameControlPage;
