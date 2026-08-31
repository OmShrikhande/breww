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
    <div className="p-4 pt-2 relative z-30 select-none">
      <div className="flex items-center justify-between mb-2.5 px-1">
        <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Stake Amount</span>
        <span className="text-[10px] font-bold text-white/60">Balance: {formatINR(balance)}</span>
      </div>

      <div className="flex items-center gap-3 mb-3">
        <div className="flex-1 flex items-center rounded-2xl bg-black/50 border border-white/10 overflow-hidden shadow-inner h-12">
          <button
            type="button"
            onClick={() => setAmount((prev) => Math.max(10, prev - 10))}
            className="w-12 h-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 font-black text-xl transition-colors active:scale-95 cursor-pointer"
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
              className="w-20 bg-transparent text-center font-black text-lg sm:text-xl text-white focus:outline-none tabular-nums"
              min={10}
              max={100000}
            />
          </div>
          <button
            type="button"
            onClick={() => setAmount((prev) => prev + 10)}
            className="w-12 h-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 font-black text-xl transition-colors active:scale-95 cursor-pointer"
            aria-label="Increase stake"
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={handleBet}
          disabled={disabled}
          className="flex items-center justify-center gap-2 px-6 h-12 rounded-2xl font-black text-sm uppercase tracking-wider transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed min-w-[130px] shadow-lg text-white cursor-pointer"
          style={{
            background: disabled ? '#27314a' : `linear-gradient(135deg, ${accent}, #2563eb)`,
            boxShadow: disabled ? 'none' : `0 4px 20px ${accent}40`,
          }}
        >
          <Zap size={16} fill="currentColor" />
          <span>Place Bet</span>
        </button>
      </div>

      {/* Stake Preset Chips */}
      <div className="grid grid-cols-5 gap-2">
        {quickBets.map((val) => {
          const isSelected = amount === val;
          return (
            <button
              key={val}
              type="button"
              onClick={() => setAmount(val)}
              className={`h-9 rounded-xl text-xs font-black border transition-all active:scale-95 cursor-pointer flex items-center justify-center ${
                isSelected
                  ? 'border-casino-gold bg-casino-gold/25 text-casino-gold shadow-[0_0_12px_rgba(245,197,66,0.3)] ring-1 ring-casino-gold'
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
