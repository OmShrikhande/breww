import React from 'react';
import { Crown, Radio } from 'lucide-react';
import { formatINR } from '../../utils/formatCurrency';
import PlayerCards from './PlayerCards';

const PlayerSeat = ({ player, className = '' }) => {
  const seatStateClasses = player.isActive
    ? 'border-amber-300/70 shadow-[0_0_30px_rgba(251,191,36,0.25)]'
    : player.isUser
      ? 'border-sky-300/50 shadow-[0_0_28px_rgba(56,189,248,0.18)]'
      : 'border-white/10';

  return (
    <div className={`absolute ${className}`}>
      <div className={`min-w-[132px] max-w-[180px] rounded-[26px] border bg-[linear-gradient(180deg,rgba(15,23,42,0.95),rgba(2,6,23,0.82))] p-2.5 text-white backdrop-blur-xl transition-transform duration-300 ${seatStateClasses} ${player.isActive ? 'scale-105' : ''}`}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${player.avatarGradient} font-black text-white shadow-lg`}>
              {player.avatar}
              {player.isDealer && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border border-amber-200/70 bg-amber-300 text-[9px] font-black text-slate-900">
                  D
                </span>
              )}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-black">{player.username}</div>
              <div className="truncate text-[11px] text-emerald-100/70">{formatINR(player.stack)}</div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {player.isWinner && <Crown size={14} className="text-amber-300" />}
            {player.isActive && <Radio size={14} className="text-emerald-300" />}
          </div>
        </div>

        <div className="mt-2 flex items-end justify-between gap-2">
          <PlayerCards cards={player.cards} compact />
          <div className="text-right">
            <div className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-white/60">
              {player.status}
            </div>
            {player.bet > 0 && (
              <div className="mt-1 text-xs font-bold text-amber-200">{formatINR(player.bet)}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerSeat;
