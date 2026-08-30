import React, { useState } from 'react';
import { Zap } from 'lucide-react';
import { useWallet } from '../../hooks/useWallet';
import { formatINR } from '../../utils/formatCurrency';

const BetPanel = ({ onPlaceBet, disabled = false, accent = '#4F8EF7' }) => {
  const { balance } = useWallet();
  const [amount, setAmount] = useState(50);
  const quickBets = [10, 50, 100, 500, 1000];

  const handleBet = () => {
    if (onPlaceBet) {
      onPlaceBet(amount);
    }
  };

  return (
    <div className="p-4 pt-2">
      <div className="flex items-center justify-between mb-2.5 px-1">
        <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Stake Amount</span>
        <span className="text-[10px] font-bold text-white/60">Balance: {formatINR(balance)}</span>
      </div>

      <div className="flex items-center gap-3 mb-3">
        <div className="flex-1 flex items-center rounded-2xl bg-black/50 border border-white/10 overflow-hidden shadow-inner">
          <button
            type="button"
            onClick={() => setAmount((prev) => Math.max(10, prev - 10))}
            className="px-4 py-3 text-white/60 hover:text-white hover:bg-white/10 font-black text-xl transition-colors active:scale-95"
          >
            −
          </button>
          <div className="flex-1 text-center py-1">
            <span className="text-[10px] text-white/30 font-bold block">₹</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Math.max(0, Number(e.target.value) || 0))}
              className="w-full bg-transparent text-center font-black text-lg sm:text-xl text-white focus:outline-none tabular-nums"
            />
          </div>
          <button
            type="button"
            onClick={() => setAmount((prev) => prev + 10)}
            className="px-4 py-3 text-white/60 hover:text-white hover:bg-white/10 font-black text-xl transition-colors active:scale-95"
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={handleBet}
          disabled={disabled}
          className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed min-w-[130px] shadow-lg text-white"
          style={{
            background: `linear-gradient(135deg, ${accent}, #2563eb)`,
            boxShadow: `0 4px 20px ${accent}40`,
          }}
        >
          <Zap size={16} fill="currentColor" />
          <span>Place Bet</span>
        </button>
      </div>

      <div className="flex gap-2">
        {quickBets.map((val) => (
          <button
            key={val}
            type="button"
            onClick={() => setAmount(val)}
            className={`flex-1 py-1.5 rounded-xl text-[11px] font-black border transition-all active:scale-95 ${
              amount === val
                ? 'border-casino-gold/80 bg-casino-gold/20 text-casino-gold shadow-glow-gold'
                : 'border-white/10 bg-white/5 text-white/60 hover:border-white/30 hover:text-white'
            }`}
          >
            {val >= 1000 ? `${val / 1000}K` : `₹${val}`}
          </button>
        ))}
      </div>
    </div>
  );
};

export default BetPanel;
