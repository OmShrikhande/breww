import React from 'react';
import { motion } from 'framer-motion';
import { Minus, Plus, Gem, Play, ShieldAlert, Sparkles } from 'lucide-react';
import { formatINR } from '../../utils/formatCurrency';

const MINE_PRESETS = [1, 2, 3, 5, 10, 15, 20, 24];
const QUICK_BETS = [10, 50, 100, 500, 1000];

const MineControls = ({
  gameStatus,
  betAmount,
  activeBet = 0,
  setBetAmount,
  mineCount,
  setMineCount,
  onStart,
  onCashout,
  revealedCount = 0,
  multiplier = 1,
  nextMultiplier,
  balance = 0,
  walletLoading = false,
  loading = false,
}) => {
  const isPlaying = gameStatus === 'playing';
  const stake = isPlaying ? activeBet : betAmount;
  const potentialWin = stake * multiplier;
  const netProfit = Math.max(0, potentialWin - stake);
  const totalSafeGems = 25 - mineCount;
  const remainingSafe = Math.max(0, totalSafeGems - revealedCount);

  const canStart = !isPlaying && !walletLoading && betAmount >= 10 && betAmount <= balance && !loading;
  const canCashout = isPlaying && revealedCount > 0 && !loading;

  return (
    <div className="game-glass rounded-2xl border border-white/10 p-3 sm:p-4 space-y-2.5 shadow-2xl bg-[#0e1626]/90 backdrop-blur-md select-none">
      {/* Top Header: Mines Config & Multiplier Status */}
      <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-2">
        <div className="flex-1">
          <div className="flex items-center gap-1 text-white/50 text-[9px] font-black uppercase tracking-widest mb-1">
            <ShieldAlert size={12} className="text-amber-400" />
            <span>Mines ({mineCount})</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {MINE_PRESETS.map((n) => (
              <button
                key={n}
                type="button"
                disabled={isPlaying || loading}
                onClick={() => setMineCount(n)}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-black border transition-all cursor-pointer ${
                  mineCount === n
                    ? 'bg-amber-400 text-black border-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.4)] ring-1 ring-white'
                    : 'border-white/10 bg-white/5 text-white/60 hover:border-white/30 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="text-right shrink-0 bg-black/40 px-3 py-1.5 rounded-xl border border-white/5">
          <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Multiplier</p>
          <p className="text-xl font-black text-casino-gold tabular-nums tracking-tight leading-none mt-0.5">{multiplier.toFixed(2)}×</p>
          {isPlaying && nextMultiplier && (
            <p className="text-[9px] font-bold text-emerald-400 flex items-center gap-0.5 justify-end mt-0.5">
              <Sparkles size={9} /> Next: {nextMultiplier.toFixed(2)}×
            </p>
          )}
        </div>
      </div>

      {/* Bet Amount Stepper & Presets */}
      {!isPlaying && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-white/40 px-1">
            <span>Stake</span>
            <span>Bal: {formatINR(balance)}</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center rounded-xl bg-black/50 border border-white/10 overflow-hidden shadow-inner h-10">
              <button
                type="button"
                onClick={() => setBetAmount(Math.max(10, betAmount - 10))}
                className="w-10 h-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 font-black text-lg transition-colors active:scale-95 cursor-pointer"
                aria-label="Decrease bet"
              >
                <Minus size={15} />
              </button>
              <div className="flex-1 text-center py-1 flex items-center justify-center">
                <span className="text-xs text-white/40 font-bold mr-1">₹</span>
                <input
                  type="number"
                  value={betAmount || ''}
                  onChange={(e) => setBetAmount(Math.max(0, Number(e.target.value) || 0))}
                  className="w-20 bg-transparent text-center font-black text-base text-white focus:outline-none tabular-nums"
                  min={10}
                  max={balance}
                />
              </div>
              <button
                type="button"
                onClick={() => setBetAmount(Math.min(balance, betAmount + 10))}
                className="w-10 h-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 font-black text-lg transition-colors active:scale-95 cursor-pointer"
                aria-label="Increase bet"
              >
                <Plus size={15} />
              </button>
            </div>
          </div>

          {/* Quick Bet Chips */}
          <div className="grid grid-cols-5 gap-1.5">
            {QUICK_BETS.map((val) => {
              const isSelected = betAmount === val;
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => setBetAmount(Math.min(val, balance))}
                  disabled={val > balance}
                  className={`h-7 rounded-lg text-[11px] font-black border transition-all active:scale-95 cursor-pointer flex items-center justify-center ${
                    isSelected
                      ? 'border-casino-gold bg-casino-gold/25 text-casino-gold shadow-[0_0_10px_rgba(245,197,66,0.3)] ring-1 ring-casino-gold'
                      : 'border-white/10 bg-white/5 text-white/70 hover:border-white/30 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed'
                  }`}
                >
                  {val >= 1000 ? `${val / 1000}K` : `₹${val}`}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Live In-Play Stats */}
      {isPlaying && (
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-2 shadow-inner">
            <Gem size={18} className="text-emerald-400 shrink-0" />
            <div>
              <p className="text-[9px] uppercase font-bold tracking-widest text-white/50">Cashout Win</p>
              <p className="text-base font-black text-emerald-300 tabular-nums leading-tight">{formatINR(potentialWin)}</p>
              <p className="text-[9px] font-bold text-emerald-400/80">+{formatINR(netProfit)} profit</p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-black/40 border border-white/10 p-2">
            <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center font-black text-xs text-amber-300 shrink-0">
              💎
            </div>
            <div>
              <p className="text-[9px] uppercase font-bold tracking-widest text-white/50">Gems Left</p>
              <p className="text-base font-black text-white tabular-nums leading-tight">{remainingSafe} / {totalSafeGems}</p>
              <p className="text-[9px] font-bold text-white/40">{revealedCount} revealed</p>
            </div>
          </div>
        </div>
      )}

      {/* Action Button: Start Game or Cashout */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        onClick={isPlaying ? onCashout : () => onStart(betAmount)}
        disabled={isPlaying ? !canCashout : !canStart}
        className={`w-full py-3 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xl cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
          isPlaying
            ? revealedCount > 0
              ? 'bg-[#f4b400] hover:bg-[#ffc107] active:bg-[#e0a800] text-black border-b-4 border-[#c79100] shadow-[0_4px_15px_rgba(244,180,0,0.4)]'
              : 'bg-slate-700 text-white/50 border-b-4 border-slate-900'
            : canStart
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white border-b-4 border-emerald-700 shadow-[0_4px_15px_rgba(16,185,129,0.4)]'
              : 'bg-slate-700 text-white/50 border-b-4 border-slate-900'
        }`}
      >
        {loading ? (
          <span>PROCESSING…</span>
        ) : isPlaying ? (
          revealedCount > 0 ? (
            <span>CASH OUT {formatINR(potentialWin)}</span>
          ) : (
            <span>PICK A TILE TO START</span>
          )
        ) : (
          <>
            <Play size={15} fill="currentColor" />
            <span>START GAME ({formatINR(betAmount)})</span>
          </>
        )}
      </motion.button>
    </div>
  );
};

export default MineControls;
