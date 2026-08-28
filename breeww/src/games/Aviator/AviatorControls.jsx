import React, { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { formatINR } from '../../utils/formatCurrency';

const AviatorControls = ({
  betAmount,
  setBetAmount,
  onPlaceBet,
  onCashout,
  gameState,
  isBetPlaced,
  hasCashedOut,
  multiplier,
  loading,
  bettingOpen,
  canCashout,
}) => {
  const [activeTab, setActiveTab] = useState('bet');
  const quickBets = [10, 100, 500, 1000];

  const canBet = bettingOpen && !isBetPlaced && !loading;
  const canCashOutNow = canCashout && isBetPlaced && !hasCashedOut && !loading;

  return (
    <div className="bg-[#1b233d] p-3 rounded-2xl border border-white/5 shadow-2xl flex flex-col items-center max-w-xl mx-auto w-full">
      <div className="flex bg-[#0b1024] rounded-full p-1 mb-4 w-[140px]">
        <button
          type="button"
          onClick={() => setActiveTab('bet')}
          className={`flex-1 py-1 rounded-full text-[9px] font-black uppercase transition-all ${
            activeTab === 'bet' ? 'bg-[#2d3a5e] text-white shadow-lg' : 'text-gray-500'
          }`}
        >
          Bet
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('auto')}
          className={`flex-1 py-1 rounded-full text-[9px] font-black uppercase transition-all ${
            activeTab === 'auto' ? 'bg-[#2d3a5e] text-white shadow-lg' : 'text-gray-500'
          }`}
        >
          Auto
        </button>
      </div>

      <div className="flex items-center gap-2 w-full">
        <div className="flex flex-col gap-2 bg-[#0b1024] p-2 rounded-xl border border-white/5 w-[130px] shrink-0">
          <div className="flex items-center justify-between px-1">
            <button
              type="button"
              onClick={() => setBetAmount(Math.max(10, betAmount - 10))}
              disabled={!canBet}
              className="w-5 h-5 rounded-full border border-gray-600 flex items-center justify-center text-gray-400 disabled:opacity-30"
            >
              <Minus size={12} />
            </button>
            <input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(Math.max(0, Number(e.target.value)))}
              disabled={!canBet}
              className="bg-transparent text-center font-black text-sm text-white focus:outline-none w-[50px] tabular-nums"
            />
            <button
              type="button"
              onClick={() => setBetAmount(betAmount + 10)}
              disabled={!canBet}
              className="w-5 h-5 rounded-full border border-gray-600 flex items-center justify-center text-gray-400 disabled:opacity-30"
            >
              <Plus size={12} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-1 px-1">
            {quickBets.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setBetAmount(val)}
                disabled={!canBet}
                className="py-1 rounded-md bg-[#1b233d] text-[10px] font-black text-gray-300 border border-white/5 disabled:opacity-40"
              >
                {val}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 h-[80px]">
          {canCashOutNow ? (
            <button
              type="button"
              onClick={onCashout}
              className="w-full h-full bg-[#f4b400] hover:bg-[#ffc107] text-black rounded-xl flex flex-col items-center justify-center transition-all shadow-lg active:scale-95 border-b-4 border-[#c79100]"
            >
              <span className="text-[10px] font-black uppercase tracking-widest mb-1">Cash Out</span>
              <span className="text-xl font-black tabular-nums">{multiplier.toFixed(2)}x</span>
              <span className="text-xs font-black">{formatINR(betAmount * multiplier)}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onPlaceBet(betAmount)}
              disabled={!canBet || betAmount < 10}
              className={`w-full h-full rounded-2xl flex flex-col items-center justify-center transition-all shadow-lg active:scale-95 ${
                canBet && betAmount >= 10
                  ? 'bg-[#28a745] hover:bg-[#218838] text-white border-b-4 border-[#1e7e34]'
                  : (isBetPlaced && !hasCashedOut) || gameState === 'running'
                    ? 'bg-[#b91c1c] text-white opacity-80 cursor-not-allowed border-b-4 border-[#991b1b]'
                    : 'bg-[#242e4d] text-gray-500 cursor-not-allowed border-b-4 border-[#1c1c1e]'
              }`}
            >
              <span className="text-2xl font-black uppercase tracking-tighter mb-0.5">
                {loading ? '…' : isBetPlaced ? 'LOCKED IN' : canBet ? 'BET' : 'WAIT'}
              </span>
              <span className="text-xs font-black opacity-90">
                {betAmount >= 10 ? `${betAmount.toFixed(2)} INR` : 'Min 10 INR'}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AviatorControls;
