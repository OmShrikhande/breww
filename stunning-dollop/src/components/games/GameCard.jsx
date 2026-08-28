import React, { useState } from 'react';
import { formatCurrency, formatNumber } from './gamesConfig';
import './GameCard.css';

const GamePreview = ({ gameId, accentColor }) => {
  switch (gameId) {
    case 'aviator':
      return (
        <div className="preview aviator-preview">
          <div className="avi-grid" />
          <div className="avi-graph">
            <svg viewBox="0 0 200 100" preserveAspectRatio="none">
              <polyline points="0,100 40,80 80,60 110,35 140,18 165,10" stroke={accentColor} strokeWidth="2.5" fill="none" />
              <polyline points="0,100 40,80 80,60 110,35 140,18 165,10 165,100" stroke={accentColor} strokeWidth="0" fill={accentColor} fillOpacity="0.12" />
            </svg>
          </div>
          <div className="avi-plane">✈️</div>
          <div className="avi-multiplier">3.24<span>x</span></div>
          <div className="avi-cash-out-btn">CASH OUT</div>
        </div>
      );

    case 'colour':
      return (
        <div className="preview colour-preview">
          <div className="col-sections">
            <div className="col-sec col-sec--red"><span>RED</span><small>2x</small></div>
            <div className="col-sec col-sec--green"><span>GREEN</span><small>2x</small></div>
            <div className="col-sec col-sec--violet"><span>VIOLET</span><small>4.5x</small></div>
          </div>
          <div className="col-ball" />
          <div className="col-timer">00:42</div>
          <div className="col-results">
            <span className="cr cr--r" />
            <span className="cr cr--g" />
            <span className="cr cr--v" />
            <span className="cr cr--r" />
            <span className="cr cr--g" />
          </div>
        </div>
      );

    case 'mines':
      return (
        <div className="preview mines-preview">
          {Array.from({ length: 25 }).map((_, i) => {
            const type = [1, 7, 12, 18].includes(i) ? 'bomb' : [3, 9, 14, 20, 22].includes(i) ? 'gem' : [5, 11].includes(i) ? 'open' : 'hidden';
            return (
              <div key={i} className={`mine-tile mine-tile--${type}`}>
                {type === 'bomb' ? '💣' : type === 'gem' ? '💎' : type === 'open' ? '' : ''}
              </div>
            );
          })}
        </div>
      );

    case 'wheel':
      return (
        <div className="preview wheel-preview">
          <div className="wheel-spin">
            <div className="wheel-inner">
              {['#DC143C','#FFD700','#00d68f','#4f8ef7','#a855f7','#f97316','#ec4899','#00d68f','#FFD700','#DC143C'].map((c, i) => (
                <div key={i} className="wheel-seg" style={{ '--i': i, '--total': 10, '--col': c }} />
              ))}
              <div className="wheel-center">WIN</div>
            </div>
            <div className="wheel-pointer">▼</div>
          </div>
        </div>
      );

    case 'dice':
      return (
        <div className="preview dice-preview">
          <div className="dice-3d">
            <div className="dice-face dice-face--front">
              <div className="dice-dots dots-5">
                <span/><span/><span/><span/><span/>
              </div>
            </div>
          </div>
          <div className="dice-3d dice-3d--small">
            <div className="dice-face dice-face--front">
              <div className="dice-dots dots-3">
                <span/><span/><span/>
              </div>
            </div>
          </div>
          <div className="dice-target">
            <span>Target: </span><strong>8</strong>
          </div>
        </div>
      );

    case 'dragon-tiger':
      return (
        <div className="preview dt-preview">
          <div className="dt-zone dt-zone--dragon">
            <div className="dt-label">🐉 Dragon</div>
            <div className="dt-card">K♠</div>
          </div>
          <div className="dt-vs">VS</div>
          <div className="dt-zone dt-zone--tiger">
            <div className="dt-label">🐅 Tiger</div>
            <div className="dt-card dt-card--tiger">7♥</div>
          </div>
        </div>
      );

    case 'andar-bahar':
      return (
        <div className="preview ab-preview">
          <div className="ab-center-card">J♣</div>
          <div className="ab-sides">
            <div className="ab-side ab-side--andar">
              <span className="ab-side-label">Andar</span>
              <div className="ab-cards">
                <div className="ab-card">3♦</div>
                <div className="ab-card">8♠</div>
              </div>
            </div>
            <div className="ab-side ab-side--bahar">
              <span className="ab-side-label">Bahar</span>
              <div className="ab-cards">
                <div className="ab-card">K♥</div>
                <div className="ab-card">2♣</div>
              </div>
            </div>
          </div>
        </div>
      );

    case 'plinko':
      return (
        <div className="preview plinko-preview">
          <div className="plinko-pegs">
            {Array.from({ length: 6 }).map((_, row) =>
              Array.from({ length: row + 2 }).map((__, col) => (
                <div key={`${row}-${col}`} className="plinko-peg" style={{ gridRow: row + 1, gridColumn: col + 1 }} />
              ))
            )}
          </div>
          <div className="plinko-ball" />
          <div className="plinko-buckets">
            {['1000x', '50x', '10x', '2x', '10x', '50x', '1000x'].map((m, i) => (
              <div key={i} className="plinko-bucket" style={{ '--hue': i === 0 || i === 6 ? 'var(--gold)' : i === 1 || i === 5 ? 'var(--orange)' : i === 2 || i === 4 ? 'var(--green)' : 'var(--blue)' }}>
                {m}
              </div>
            ))}
          </div>
        </div>
      );

    default:
      return <div className="preview" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>🎮</div>;
  }
};

const GameCard = ({ game, onConfigure, onToggleStatus, onControl }) => {
  const [toggling, setToggling] = useState(false);

  const handleToggle = async () => {
    if (!onToggleStatus) return;
    setToggling(true);
    try {
      await onToggleStatus(game.id);
    } finally {
      setToggling(false);
    }
  };

  const statusBadge = {
    active:      { label: 'Live',        cls: 'badge-active' },
    inactive:    { label: 'Offline',     cls: 'badge-inactive' },
    maintenance: { label: 'Maintenance', cls: 'badge-maintenance' },
  }[game.status] || { label: 'Unknown', cls: 'badge-inactive' };

  return (
    <div className={`game-card game-card--${game.status}`} style={{ '--accent': game.accentColor }}>
      <div className="game-card__preview-wrap" style={{ background: game.gradient }}>
        <GamePreview gameId={game.id} accentColor={game.accentColor} />
        <div className="game-card__overlay-info">
          <span className={`badge ${statusBadge.cls}`}>
            <span className="badge-dot" />
            {statusBadge.label}
          </span>
          <div className="game-card__category">{game.category}</div>
        </div>
        <div className="game-card__online-count">
          <span className="online-pulse" />
          <span>{formatNumber(game.stats.playersOnline)} online</span>
        </div>
      </div>

      <div className="game-card__body">
        <div className="game-card__title-row">
          <div className="game-card__name-wrap">
            <span className="game-card__icon">{game.icon}</span>
            <div>
              <h3 className="game-card__name">{game.name}</h3>
              <p className="game-card__tagline">{game.tagline}</p>
            </div>
          </div>
          {onToggleStatus && (
            <label className="toggle-switch" title={game.settings.enabled ? 'Disable game' : 'Enable game'}>
              <input
                type="checkbox"
                checked={game.settings.enabled}
                onChange={handleToggle}
                disabled={toggling}
              />
              <span className="toggle-slider" />
            </label>
          )}
        </div>

        <div className="game-card__stats">
          <div className="stat-pill">
            <span className="stat-pill__val">{formatNumber(game.stats.betsToday)}</span>
            <span className="stat-pill__lbl">Bets Today</span>
          </div>
          <div className="stat-pill">
            <span className="stat-pill__val">{formatCurrency(game.stats.revenueToday)}</span>
            <span className="stat-pill__lbl">Revenue</span>
          </div>
          <div className="stat-pill">
            <span className="stat-pill__val">{game.stats.winRate}%</span>
            <span className="stat-pill__lbl">Win Rate</span>
          </div>
        </div>

        <div className="game-card__meta">
          <span className="meta-chip">Min: ${game.settings.minBet}</span>
          <span className="meta-chip">Max: {formatCurrency(game.settings.maxBet)}</span>
          <span className="meta-chip">RTP: {game.settings.rtp}%</span>
          {game.settings.maintenanceMode && (
            <span className="meta-chip meta-chip--warn">⚠ Maintenance</span>
          )}
        </div>

        <div className="game-card__action-row">
          {onConfigure && (
            <button className="game-card__configure-btn" onClick={() => onConfigure(game)}>
              ⚙️ Configure
            </button>
          )}
          {onControl && (
            <button
              className="game-card__control-btn"
              onClick={() => onControl(game)}
              title="Open Live Round Control"
            >
              🎮 Live Control
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameCard;
