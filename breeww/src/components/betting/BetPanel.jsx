import React, { useState } from 'react';
import { Zap } from 'lucide-react';
import { useWallet } from '../../hooks/useWallet';
import { formatINR } from '../../utils/formatCurrency';

const BetPanel = ({ onPlaceBet, disabled = false, accent = '#4F8EF7' }) => {
  const { balance } = useWallet();
  const [amount, setAmount] = useState(50);
  const quickBets = [10, 50, 100, 500, 1000];

  const handleBet = (e) => {
    e?.preventDefault?.();
    if (onPlaceBet) {
      onPlaceBet(amount);
    }
  };

  return (
    <div className="p-2.5 sm:p-3 relative z-30 select-none">
      <div className="flex items-center justify-between mb-1.5 px-1">
        <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Stake Amount</span>
        <span className="text-[10px] font-bold text-white/60">Balance: {formatINR(balance)}</span>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <div className="flex-1 flex items-center rounded-xl bg-black/50 border border-white/10 overflow-hidden shadow-inner h-10 sm:h-11">
          <button
            type="button"
            onClick={() => setAmount((prev) => Math.max(10, prev - 10))}
            className="w-10 h-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 font-black text-lg transition-colors active:scale-95 cursor-pointer"
            aria-label="Decrease stake"
          >
            −
          </button>
          <div className="flex-1 text-center py-1 flex items-center justify-center">
            <span className="text-xs text-white/40 font-bold mr-1">₹</span>
            <input
              type="number"
              value={amount || ''}
              onChange={(e) => setAmount(Math.max(0, Number(e.target.value) || 0))}
              className="w-16 sm:w-20 bg-transparent text-center font-black text-base sm:text-lg text-white focus:outline-none tabular-nums"
              min={10}
              max={100000}
            />
          </div>
          <button
            type="button"
            onClick={() => setAmount((prev) => prev + 10)}
            className="w-10 h-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 font-black text-lg transition-colors active:scale-95 cursor-pointer"
            aria-label="Increase stake"
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={handleBet}
          disabled={disabled}
          className="flex items-center justify-center gap-1.5 px-5 h-10 sm:h-11 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed min-w-[120px] shadow-lg text-white cursor-pointer"
          style={{
            background: disabled ? '#27314a' : `linear-gradient(135deg, ${accent}, #2563eb)`,
            boxShadow: disabled ? 'none' : `0 4px 15px ${accent}40`,
          }}
        >
          <Zap size={14} fill="currentColor" />
          <span>Place Bet</span>
        </button>
      </div>

      {/* Stake Preset Chips */}
      <div className="grid grid-cols-5 gap-1.5">
        {quickBets.map((val) => {
          const isSelected = amount === val;
          return (
            <button
              key={val}
              type="button"
              onClick={() => setAmount(val)}
              className={`h-7 sm:h-8 rounded-lg text-[11px] font-black border transition-all active:scale-95 cursor-pointer flex items-center justify-center ${
                isSelected
                  ? 'border-casino-gold bg-casino-gold/25 text-casino-gold shadow-[0_0_10px_rgba(245,197,66,0.3)] ring-1 ring-casino-gold'
                  : 'border-white/10 bg-white/5 text-white/70 hover:border-white/30 hover:text-white hover:bg-white/10'
              }`}
            >
              {val >= 1000 ? `${val / 1000}K` : `₹${val}`}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BetPanel;
