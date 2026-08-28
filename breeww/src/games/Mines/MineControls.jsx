import React from 'react';
import { motion } from 'framer-motion';
import { Minus, Plus, Gem, Play } from 'lucide-react';
import { formatINR } from '../../utils/formatCurrency';

const MINE_PRESETS = [1, 3, 5, 10, 15, 24];
const QUICK_BETS = [10, 50, 100, 500];

const MineControls = ({
  gameStatus,
  betAmount,
  activeBet = 0,
  setBetAmount,
  mineCount,
  setMineCount,
  onStart,
  onCashout,
  revealedCount,
  multiplier,
  nextMultiplier,
  balance,
  walletLoading = false,
  loading,
}) => {
  const isPlaying = gameStatus === 'playing';
  const stake = isPlaying ? activeBet : betAmount;
  const potentialWin = stake * multiplier;
  const canStart = !isPlaying && !walletLoading && betAmount >= 10 && betAmount <= balance && !loading;
  const canCashout = isPlaying && revealedCount > 0 && !loading;

  return (
    <div className="game-glass rounded-2xl border border-white/10 p-4 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Mines on board</p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {MINE_PRESETS.map((n) => (
              <button
                key={n}
                type="button"
                disabled={isPlaying}
                onClick={() => setMineCount(n)}
                className={`px-2.5 py-1 rounded-lg text-xs font-black border transition-all ${
                  mineCount === n
                    ? 'bg-casino-gold/20 border-casino-gold text-casino-gold'
                    : 'border-white/10 text-white/50 hover:border-white/25 disabled:opacity-40'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Multiplier</p>
          <p className="text-2xl font-black text-casino-gold tabular-nums">{multiplier.toFixed(2)}×</p>
          {isPlaying && nextMultiplier && (
            <p className="text-[10px] text-white/40">Next: {nextMultiplier.toFixed(2)}×</p>
          )}
        </div>
      </div>

      {!isPlaying && (
        <>
          <div>
            <p className="game-section-title">Bet amount</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setBetAmount(Math.max(10, betAmount - 10))}
                className="p-3 rounded-xl bg-white/5 border border-white/10 text-white"
              >
                <Minus size={16} />
              </button>
              <div className="flex-1 text-center py-3 rounded-xl bg-black/30 border border-white/10">
                <span className="text-xl font-black text-white tabular-nums">{formatINR(betAmount)}</span>
              </div>
              <button
                type="button"
                onClick={() => setBetAmount(Math.min(balance, betAmount + 10))}
                className="p-3 rounded-xl bg-white/5 border border-white/10 text-white"
              >
                <Plus size={16} />
              </button>
            </div>
            <div className="flex gap-2 mt-2">
              {QUICK_BETS.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setBetAmount(Math.min(v, balance))}
                  disabled={v > balance}
                  className={`flex-1 py-1.5 rounded-lg text-[11px] font-black border ${
                    betAmount === v ? 'border-casino-gold/50 bg-casino-gold/10 text-casino-gold' : 'border-white/10 text-white/40'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {isPlaying && revealedCount > 0 && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-4 py-3">
          <Gem size={18} className="text-emerald-400" />
          <div>
            <p className="text-[10px] uppercase tracking-widest text-white/40">Cashout value</p>
            <p className="font-black text-emerald-300">{formatINR(potentialWin)}</p>
          </div>
        </div>
      )}

      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        onClick={isPlaying ? onCashout : () => onStart(betAmount)}
        disabled={isPlaying ? !canCashout : !canStart}
        className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
          isPlaying
            ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/30'
            : 'bg-gradient-to-r from-casino-accent to-blue-600 text-white shadow-glow'
        }`}
      >
        <Play size={16} fill="currentColor" />
        {loading ? 'Please wait…' : walletLoading && !isPlaying ? 'Loading balance…' : isPlaying
          ? (revealedCount === 0 ? 'Pick a tile first' : `Cash out ${formatINR(potentialWin)}`)
          : `Start · ${mineCount} mines`}
      </motion.button>
    </div>
  );
};

export default MineControls;
