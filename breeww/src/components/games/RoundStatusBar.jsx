import React from 'react';
import { Radio, Timer } from 'lucide-react';

const RoundStatusBar = ({ roundId, timerLeft, bettingOpen, accent = '#6366f1' }) => {
  const urgent = timerLeft <= 5 && bettingOpen;
  const mins = Math.floor(timerLeft / 60);
  const secs = timerLeft % 60;
  const display = mins > 0 ? `${mins}:${String(secs).padStart(2, '0')}` : `${secs}s`;

  return (
    <div className="game-glass rounded-2xl p-4 border border-white/10 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{ background: `radial-gradient(circle at top right, ${accent}, transparent 60%)` }}
      />
      <div className="relative flex items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="live-pulse flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-400">
              <Radio size={12} className="animate-pulse" />
              Live
            </span>
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
              Round #{roundId || '—'}
            </span>
          </div>
          <p className="text-xs text-white/50">
            {bettingOpen ? 'Place your bet before timer ends' : 'Betting closed — awaiting result'}
          </p>
        </div>
        <div className={`flex flex-col items-center justify-center min-w-[72px] rounded-xl px-3 py-2 border ${
          urgent ? 'border-red-500/50 bg-red-500/10' : 'border-white/10 bg-black/20'
        }`}>
          <Timer size={14} className={urgent ? 'text-red-400 mb-0.5' : 'text-sky-400 mb-0.5'} />
          <span className={`font-mono font-black text-xl tabular-nums ${urgent ? 'text-red-400' : 'text-white'}`}>
            {display}
          </span>
        </div>
      </div>
    </div>
  );
};

export default RoundStatusBar;
