import React, { useState, useEffect } from 'react';
import './GameControlModal.css';

const TABS = ['General', 'Betting', 'Game Settings', 'Commission'];

const FormRow = ({ label, hint, children }) => (
  <div className="form-row">
    <div className="form-row__label">
      <span>{label}</span>
      {hint && <span className="form-row__hint">{hint}</span>}
    </div>
    <div className="form-row__control">{children}</div>
  </div>
);

const NumberInput = ({ value, onChange, min, max, step = 1, prefix, suffix }) => (
  <div className="num-input-wrap">
    {prefix && <span className="num-input-affix">{prefix}</span>}
    <input
      type="number"
      className="modal-input"
      value={value}
      onChange={e => onChange(Number(e.target.value))}
      min={min}
      max={max}
      step={step}
    />
    {suffix && <span className="num-input-affix">{suffix}</span>}
  </div>
);

const GameSpecificSettings = ({ game, settings, onChange }) => {
  const set = (key, val) => onChange({ ...settings, [key]: val });

  switch (game.id) {
    case 'aviator':
      return (
        <>
          <FormRow label="Max Multiplier" hint="Maximum cashout limit">
            <NumberInput value={settings.maxMultiplier} onChange={v => set('maxMultiplier', v)} min={2} max={1000} suffix="x" />
          </FormRow>
          <FormRow label="Min Crash Point" hint="Earliest possible crash">
            <NumberInput value={settings.minCrashPoint} onChange={v => set('minCrashPoint', v)} min={1.01} max={2} step={0.01} suffix="x" />
          </FormRow>
          <FormRow label="Avg Crash Point" hint="Statistical average target">
            <NumberInput value={settings.avgCrashPoint} onChange={v => set('avgCrashPoint', v)} min={1.5} max={10} step={0.1} suffix="x" />
          </FormRow>
          <FormRow label="Bet Cooldown" hint="Seconds between rounds">
            <NumberInput value={settings.betCooldown} onChange={v => set('betCooldown', v)} min={0} max={60} suffix="sec" />
          </FormRow>
          <FormRow label="Max Active Players">
            <NumberInput value={settings.maxActivePlayers} onChange={v => set('maxActivePlayers', v)} min={1} max={50000} />
          </FormRow>
        </>
      );

    case 'colour':
      return (
        <>
          <FormRow label="Round Duration">
            <NumberInput value={settings.roundDuration} onChange={v => set('roundDuration', v)} min={10} max={300} suffix="sec" />
          </FormRow>
          <FormRow label="Result Delay" hint="Delay before showing result">
            <NumberInput value={settings.resultDelay} onChange={v => set('resultDelay', v)} min={1} max={30} suffix="sec" />
          </FormRow>
          <FormRow label="Red Multiplier">
            <NumberInput value={settings.redMultiplier} onChange={v => set('redMultiplier', v)} min={1} max={10} step={0.1} suffix="x" />
          </FormRow>
          <FormRow label="Green Multiplier">
            <NumberInput value={settings.greenMultiplier} onChange={v => set('greenMultiplier', v)} min={1} max={10} step={0.1} suffix="x" />
          </FormRow>
          <FormRow label="Violet Multiplier">
            <NumberInput value={settings.violetMultiplier} onChange={v => set('violetMultiplier', v)} min={1} max={20} step={0.5} suffix="x" />
          </FormRow>
        </>
      );

    case 'mines':
      return (
        <>
          <FormRow label="Grid Size" hint="NxN grid (e.g. 5 = 5x5)">
            <NumberInput value={settings.gridSize} onChange={v => set('gridSize', v)} min={3} max={7} />
          </FormRow>
          <FormRow label="Min Mines">
            <NumberInput value={settings.minMines} onChange={v => set('minMines', v)} min={1} max={settings.maxMines - 1} />
          </FormRow>
          <FormRow label="Max Mines">
            <NumberInput value={settings.maxMines} onChange={v => set('maxMines', v)} min={settings.minMines + 1} max={settings.gridSize * settings.gridSize - 1} />
          </FormRow>
          <FormRow label="Default Mines" hint="Pre-selected mine count">
            <NumberInput value={settings.defaultMines} onChange={v => set('defaultMines', v)} min={1} max={settings.maxMines} />
          </FormRow>
        </>
      );

    case 'wheel':
      return (
        <>
          <FormRow label="Segments" hint="Number of wheel segments">
            <NumberInput value={settings.segments} onChange={v => set('segments', v)} min={4} max={20} />
          </FormRow>
          <FormRow label="Spin Duration">
            <NumberInput value={settings.spinDuration} onChange={v => set('spinDuration', v)} min={3} max={30} suffix="sec" />
          </FormRow>
        </>
      );

    case 'dice':
      return (
        <>
          <FormRow label="Roll Animation Duration">
            <NumberInput value={settings.rollDuration} onChange={v => set('rollDuration', v)} min={1} max={15} suffix="sec" />
          </FormRow>
        </>
      );

    case 'dragon-tiger':
      return (
        <>
          <FormRow label="Deck Count">
            <NumberInput value={settings.deckCount} onChange={v => set('deckCount', v)} min={1} max={8} />
          </FormRow>
          <FormRow label="Dragon Multiplier">
            <NumberInput value={settings.dragonMultiplier} onChange={v => set('dragonMultiplier', v)} min={1} max={3} step={0.05} suffix="x" />
          </FormRow>
          <FormRow label="Tiger Multiplier">
            <NumberInput value={settings.tigerMultiplier} onChange={v => set('tigerMultiplier', v)} min={1} max={3} step={0.05} suffix="x" />
          </FormRow>
          <FormRow label="Tie Multiplier">
            <NumberInput value={settings.tieMultiplier} onChange={v => set('tieMultiplier', v)} min={5} max={20} step={0.5} suffix="x" />
          </FormRow>
        </>
      );

    case 'andar-bahar':
      return (
        <>
          <FormRow label="Deck Count">
            <NumberInput value={settings.deckCount} onChange={v => set('deckCount', v)} min={1} max={4} />
          </FormRow>
          <FormRow label="Andar Multiplier">
            <NumberInput value={settings.andarMultiplier} onChange={v => set('andarMultiplier', v)} min={1} max={3} step={0.05} suffix="x" />
          </FormRow>
          <FormRow label="Bahar Multiplier">
            <NumberInput value={settings.baharMultiplier} onChange={v => set('baharMultiplier', v)} min={1} max={3} step={0.05} suffix="x" />
          </FormRow>
        </>
      );

    case 'plinko':
      return (
        <>
          <FormRow label="Rows (Peg Rows)">
            <NumberInput value={settings.rows} onChange={v => set('rows', v)} min={8} max={24} />
          </FormRow>
          <FormRow label="Risk Level">
            <select
              className="modal-input"
              value={settings.risk}
              onChange={e => set('risk', e.target.value)}
            >
              <option value="low">Low Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="high">High Risk</option>
            </select>
          </FormRow>
        </>
      );

    default:
      return <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No specific settings for this game.</p>;
  }
};

const GameControlModal = ({ game, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState('General');
  const [settings, setSettings] = useState({ ...game.settings });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings({ ...game.settings });
    setActiveTab('General');
  }, [game]);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleSave = () => {
    onSave(game.id, settings);
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 1000);
  };

  const set = (key, val) => setSettings(prev => ({ ...prev, [key]: val }));

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-panel">
        <div className="modal-header">
          <div className="modal-header-left">
            <div className="modal-game-icon" style={{ background: game.gradient }}>
              {game.icon}
            </div>
            <div>
              <h2 className="modal-title">{game.name}</h2>
              <p className="modal-subtitle">Game Configuration Panel</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="modal-tabs">
          {TABS.map(tab => (
            <button
              key={tab}
              className={`modal-tab ${activeTab === tab ? 'modal-tab--active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="modal-body">
          {activeTab === 'General' && (
            <div className="settings-section">
              <div className="settings-section-title">Game Status</div>

              <FormRow label="Game Enabled" hint="Master on/off switch for this game">
                <label className="toggle-switch">
                  <input type="checkbox" checked={settings.enabled} onChange={e => set('enabled', e.target.checked)} />
                  <span className="toggle-slider" />
                </label>
              </FormRow>

              <FormRow label="Maintenance Mode" hint="Show game but block new bets">
                <label className="toggle-switch">
                  <input type="checkbox" checked={settings.maintenanceMode} onChange={e => set('maintenanceMode', e.target.checked)} />
                  <span className="toggle-slider" />
                </label>
              </FormRow>

              <FormRow label="Manual Result Mode" hint="Admin manually triggers each result">
                <label className="toggle-switch">
                  <input type="checkbox" checked={settings.manualResultMode} onChange={e => set('manualResultMode', e.target.checked)} />
                  <span className="toggle-slider" />
                </label>
              </FormRow>

              {!settings.manualResultMode && (
                <FormRow label="Auto Result Interval" hint="Seconds between automatic rounds">
                  <NumberInput value={settings.autoResultInterval} onChange={v => set('autoResultInterval', v)} min={5} max={600} suffix="sec" />
                </FormRow>
              )}

              <div className="settings-section-title" style={{ marginTop: 20 }}>Status Info</div>
              <div className="status-info-grid">
                <div className="status-info-card">
                  <span className="status-info-val">{game.stats.playersOnline.toLocaleString()}</span>
                  <span className="status-info-lbl">Players Online</span>
                </div>
                <div className="status-info-card">
                  <span className="status-info-val">{game.stats.betsToday.toLocaleString()}</span>
                  <span className="status-info-lbl">Bets Today</span>
                </div>
                <div className="status-info-card">
                  <span className="status-info-val">${game.stats.revenueToday.toLocaleString()}</span>
                  <span className="status-info-lbl">Revenue Today</span>
                </div>
                <div className="status-info-card">
                  <span className="status-info-val">{game.stats.winRate}%</span>
                  <span className="status-info-lbl">Win Rate</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Betting' && (
            <div className="settings-section">
              <div className="settings-section-title">Bet Limits</div>

              <FormRow label="Minimum Bet" hint="Minimum allowed bet per round">
                <NumberInput value={settings.minBet} onChange={v => set('minBet', v)} min={1} max={settings.maxBet} prefix="₹" />
              </FormRow>

              <FormRow label="Maximum Bet" hint="Maximum allowed bet per round">
                <NumberInput value={settings.maxBet} onChange={v => set('maxBet', v)} min={settings.minBet} max={10000000} prefix="₹" />
              </FormRow>

              <div className="settings-section-title" style={{ marginTop: 20 }}>House Edge & RTP</div>

              <FormRow label="House Edge" hint="Casino advantage percentage">
                <NumberInput value={settings.houseEdge} onChange={v => { set('houseEdge', v); set('rtp', Math.max(0, 100 - v)); }} min={0} max={50} step={0.1} suffix="%" />
              </FormRow>

              <FormRow label="RTP (Return to Player)" hint="Player return percentage">
                <NumberInput value={settings.rtp} onChange={v => { set('rtp', v); set('houseEdge', Math.max(0, 100 - v)); }} min={50} max={100} step={0.1} suffix="%" />
              </FormRow>

              <div className="rtp-bar-wrap">
                <div className="rtp-bar-labels">
                  <span style={{ color: 'var(--red)' }}>House Edge: {settings.houseEdge}%</span>
                  <span style={{ color: 'var(--green)' }}>RTP: {settings.rtp}%</span>
                </div>
                <div className="rtp-bar">
                  <div className="rtp-bar__fill" style={{ width: `${settings.rtp}%` }} />
                  <div className="rtp-bar__edge" style={{ width: `${settings.houseEdge}%` }} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Game Settings' && (
            <div className="settings-section">
              <div className="settings-section-title">Game-Specific Configuration</div>
              <GameSpecificSettings game={game} settings={settings} onChange={setSettings} />
            </div>
          )}

          {activeTab === 'Commission' && (
            <div className="settings-section">
              <div className="settings-section-title">Commission Settings</div>

              <FormRow label="Commission Rate" hint="Platform commission on each bet">
                <NumberInput value={settings.commissionRate} onChange={v => set('commissionRate', v)} min={0} max={30} step={0.05} suffix="%" />
              </FormRow>

              <div className="commission-preview">
                <div className="commission-preview-title">Commission Preview</div>
                <div className="commission-rows">
                  {[100, 500, 1000, 5000, 10000].map(bet => (
                    <div key={bet} className="commission-row">
                      <span className="commission-bet">₹{bet.toLocaleString()} bet</span>
                      <span className="commission-arrow">→</span>
                      <span className="commission-val">
                        ₹{((bet * settings.commissionRate) / 100).toFixed(2)} commission
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="settings-section-title" style={{ marginTop: 20 }}>Daily Revenue Estimate</div>
              <div className="revenue-estimate">
                <div className="rev-est-row">
                  <span>Avg bets per day (last 7d)</span>
                  <strong>{game.stats.betsToday.toLocaleString()}</strong>
                </div>
                <div className="rev-est-row">
                  <span>Avg bet size</span>
                  <strong>₹{Math.round(game.stats.revenueToday / Math.max(game.stats.betsToday, 1))}</strong>
                </div>
                <div className="rev-est-row rev-est-row--highlight">
                  <span>Est. commission at {settings.commissionRate}%</span>
                  <strong style={{ color: 'var(--green)' }}>
                    ₹{Math.round((game.stats.revenueToday * settings.commissionRate) / 100).toLocaleString()}
                  </strong>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="modal-btn modal-btn--cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            className={`modal-btn modal-btn--save ${saved ? 'modal-btn--saved' : ''}`}
            onClick={handleSave}
          >
            {saved ? '✓ Saved!' : '💾 Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameControlModal;
