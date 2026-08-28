import React, { useState } from 'react';
import { Zap } from 'lucide-react';
import { useWallet } from '../../context/WalletContext';
import { formatINR } from '../../utils/formatCurrency';

const BetPanel = ({ onPlaceBet, disabled, accent = '#4F8EF7' }) => {
  const { balance } = useWallet();
  const [amount, setAmount] = useState(50);
  const quickBets = [10, 50, 100, 500, 1000];

  const canBet = !disabled && amount > 0 && amount <= balance;

  return (
    <div className="p-4 pt-3">
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/35">Stake amount</span>
        <span className="text-[10px] font-bold text-white/50">Max {formatINR(balance)}</span>
      </div>

      <div className="flex items-center gap-3 mb-3">
        <div className="flex-1 flex items-center rounded-xl bg-black/40 border border-white/10 overflow-hidden">
          <button
            type="button"
            onClick={() => setAmount(Math.max(10, amount - 10))}
            className="px-4 py-3.5 text-white/50 hover:text-white hover:bg-white/5 font-bold text-lg"
          >
            −
          </button>
          <div className="flex-1 text-center">
            <span className="text-[10px] text-white/30 block">₹</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value) || 0)}
              className="w-full bg-transparent text-center font-black text-xl text-white focus:outline-none tabular-nums"
            />
          </div>
          <button
            type="button"
            onClick={() => setAmount(amount + 10)}
            className="px-4 py-3.5 text-white/50 hover:text-white hover:bg-white/5 font-bold text-lg"
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={() => onPlaceBet?.(amount)}
          disabled={!canBet}
          className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-black text-sm uppercase tracking-wider transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed min-w-[130px]"
          style={{
            background: canBet ? `linear-gradient(135deg, ${accent}, #2563eb)` : undefined,
            boxShadow: canBet ? `0 4px 20px ${accent}55` : undefined,
          }}
        >
          <Zap size={16} fill="currentColor" />
          Bet
        </button>
      </div>

      <div className="flex gap-2">
        {quickBets.map((val) => (
          <button
            key={val}
            type="button"
            onClick={() => setAmount(val)}
            disabled={val > balance}
            className={`flex-1 py-2 rounded-lg text-[11px] font-black border transition-all ${
              amount === val
                ? 'border-casino-gold/60 bg-casino-gold/15 text-casino-gold'
                : 'border-white/10 bg-white/5 text-white/50 hover:border-white/20 disabled:opacity-30'
            }`}
          >
            {val >= 1000 ? `${val / 1000}K` : val}
          </button>
        ))}
      </div>
    </div>
  );
};

export default BetPanel;
