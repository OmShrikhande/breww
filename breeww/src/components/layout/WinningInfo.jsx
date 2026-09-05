import React from 'react';
import { Trophy, TrendingUp, Sparkles, Crown } from 'lucide-react';
import { formatINR } from '../../utils/formatCurrency';

const WINNERS = [
  { id: 1, name: 'Player 98***120', game: 'Aviator', amount: 18450, vip: 'VIP 3', mult: '3.69x', icon: '✈️', color: 'from-red-500 to-rose-600' },
  { id: 2, name: 'Player 91***482', game: 'Colour Prediction', amount: 4500, vip: 'VIP 2', mult: '9.00x', icon: '🎨', color: 'from-emerald-500 to-teal-600' },
  { id: 3, name: 'Player 97***339', game: 'Mines', amount: 12700, vip: 'VIP 4', mult: '5.20x', icon: '💎', color: 'from-amber-500 to-yellow-600' },
  { id: 4, name: 'Player 99***810', game: 'Dragon Tiger', amount: 8200, vip: 'VIP 2', mult: '1.95x', icon: '🐉', color: 'from-purple-500 to-indigo-600' },
  { id: 5, name: 'Player 93***661', game: 'Dice Roll', amount: 24000, vip: 'VIP 5', mult: '8.00x', icon: '🎲', color: 'from-sky-500 to-blue-600' },
  { id: 6, name: 'Player 95***204', game: 'Andar Bahar', amount: 6400, vip: 'VIP 3', mult: '1.95x', icon: '🃏', color: 'from-orange-500 to-amber-600' },
];

const WinningInfo = () => {
  return (
    <div className="px-4 mb-6 select-none animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Trophy size={16} />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-tight flex items-center gap-1.5">
              Live Winning Feed
            </h2>
            <p className="text-[10px] text-amber-300/60">Real-time multiplayer jackpot payouts</p>
          </div>
        </div>
        <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[9px] font-black uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          Live
        </span>
      </div>

      {/* Winners List */}
      <div className="space-y-2">
        {WINNERS.map((w) => (
          <div
            key={w.id}
            className="rounded-2xl p-3 bg-[#1C0202]/90 border border-amber-500/20 flex items-center justify-between hover:border-amber-500/40 transition-all shadow-md"
          >
            {/* Left: Avatar & User */}
            <div className="flex items-center gap-2.5">
              <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${w.color} flex items-center justify-center text-lg shadow-md shrink-0 border border-white/20`}>
                {w.icon}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white font-mono">{w.name}</span>
                  <span className="text-[8px] font-black uppercase px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    {w.vip}
                  </span>
                </div>
                <p className="text-[10px] text-white/50 font-medium">Won on {w.game} ({w.mult})</p>
              </div>
            </div>

            {/* Right: Payout Amount */}
            <div className="text-right">
              <span className="text-xs sm:text-sm font-black font-mono text-emerald-400 block tracking-tight">
                +{formatINR(w.amount)}
              </span>
              <span className="text-[8px] font-bold uppercase text-amber-400/60 tracking-wider">
                Payout Credited
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WinningInfo;
