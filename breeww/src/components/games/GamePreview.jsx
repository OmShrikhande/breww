import React from 'react';
import './GamePreview.css';

const GamePreview = ({ gameId, accentColor = '#4f8ef7' }) => {
  const normId = String(gameId).toLowerCase();

  switch (normId) {
    case 'andar-bahar':
      return (
        <div className="preview-container ab-preview">
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

    case 'aviator':
      return (
        <div className="preview-container aviator-preview">
          <div className="avi-grid" />
          <div className="avi-graph">
            <svg viewBox="0 0 200 100" preserveAspectRatio="none">
              <polyline points="0,100 40,80 80,60 110,35 140,18 165,10" stroke={accentColor} strokeWidth="2.5" fill="none" />
              <polyline points="0,100 40,80 80,60 110,35 140,18 165,10 165,100" stroke={accentColor} strokeWidth="0" fill={accentColor} fillOpacity="0.15" />
            </svg>
          </div>
          <div className="avi-plane">✈️</div>
          <div className="avi-multiplier">3.24<span>x</span></div>
          <div className="avi-cash-out-btn">CASH OUT</div>
        </div>
      );

    case 'colour':
    case 'color-prediction':
      return (
        <div className="preview-container colour-preview">
          <div className="col-results">
            <span className="cr cr--r" />
            <span className="cr cr--g" />
            <span className="cr cr--v" />
            <span className="cr cr--r" />
          </div>
          <div className="col-timer">00:42</div>
          <div className="col-ball" />
          <div className="col-sections">
            <div className="col-sec col-sec--red"><span>RED</span><small>2x</small></div>
            <div className="col-sec col-sec--green"><span>GREEN</span><small>2x</small></div>
            <div className="col-sec col-sec--violet"><span>VIOLET</span><small>4.5x</small></div>
          </div>
        </div>
      );

    case 'mines':
      return (
        <div className="preview-container mines-preview">
          {Array.from({ length: 25 }).map((_, i) => {
            const type = [1, 7, 12, 18].includes(i) ? 'bomb' : [3, 9, 14, 20, 22].includes(i) ? 'gem' : [5, 11].includes(i) ? 'open' : 'hidden';
            return (
              <div key={i} className={`mine-tile mine-tile--${type}`}>
                {type === 'bomb' ? '💣' : type === 'gem' ? '💎' : ''}
              </div>
            );
          })}
        </div>
      );

    case 'wheel':
    case 'spin-wheel':
      return (
        <div className="preview-container wheel-preview">
          <div className="wheel-spin">
            <div className="wheel-inner">
              {['#ef4444', '#ffd700', '#10b981', '#4f8ef7', '#a855f7', '#f97316', '#ec4899', '#10b981', '#ffd700', '#ef4444'].map((c, i) => (
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
        <div className="preview-container dice-preview">
          <div className="dice-3d">
            <div className="dice-dots dots-5">
              <span/><span/><span/><span/><span/>
            </div>
          </div>
          <div className="dice-3d dice-3d--small">
            <div className="dice-dots dots-3">
              <span/><span/><span/>
            </div>
          </div>
          <div className="dice-target">
            <span>Target: </span><strong>8</strong>
          </div>
        </div>
      );

    case 'dragon-tiger':
      return (
        <div className="preview-container dt-preview">
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

    case 'plinko':
      return (
        <div className="preview-container plinko-preview">
          <div className="plinko-ball" />
          <div className="plinko-pegs">
            {Array.from({ length: 6 }).map((_, row) =>
              Array.from({ length: row + 2 }).map((__, col) => (
                <div key={`${row}-${col}`} className="plinko-peg" />
              ))
            )}
          </div>
          <div className="plinko-buckets">
            {['1000x', '50x', '10x', '2x', '10x', '50x', '1000x'].map((m, i) => {
              const bg = i === 0 || i === 6 ? '#f59e0b' : i === 1 || i === 5 ? '#f97316' : i === 2 || i === 4 ? '#10b981' : '#3b82f6';
              return (
                <div key={i} className="plinko-bucket" style={{ background: bg }}>
                  {m}
                </div>
              );
            })}
          </div>
        </div>
      );

    case 'roulette':
      return (
        <div className="preview-container roulette-preview">
          <div className="roulette-wheel">
            <div className="roulette-center">36</div>
            <div className="roulette-ball" />
          </div>
        </div>
      );

    case 'poker':
      return (
        <div className="preview-container poker-preview">
          <div className="poker-card">A♠</div>
          <div className="poker-card">K♥</div>
          <div className="poker-card">Q♠</div>
        </div>
      );

    case 'chamber-risk':
      return (
        <div className="preview-container chamber-preview">
          <div className="chamber-cylinder">
            <div className="chamber-core">⚡</div>
          </div>
        </div>
      );

    default:
      return (
        <div className="preview-container text-4xl flex items-center justify-center">
          🎮
        </div>
      );
  }
};

export default GamePreview;
