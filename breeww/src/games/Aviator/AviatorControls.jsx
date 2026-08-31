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
  balance = 0,
  isAuthenticated = true,
}) => {
  const [activeTab, setActiveTab] = useState('bet');
  const quickBets = [10, 50, 100, 500, 1000];

  const hasInsufficientBalance = isAuthenticated && balance < betAmount;
  const isCurrentlyActiveBet = Boolean(isBetPlaced && !hasCashedOut);
  const canBet = (bettingOpen || !isAuthenticated) && !isCurrentlyActiveBet && !loading && !hasInsufficientBalance;
  const canCashOutNow = (canCashout || gameState === 'running') && isCurrentlyActiveBet && !loading;

  return (
    <div className="bg-[#1b233d] p-3 rounded-2xl border border-white/5 shadow-2xl flex flex-col items-center max-w-xl mx-auto w-full">
      <div className="flex bg-[#0b1024] rounded-full p-1 mb-3 w-[140px]">
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
        {/* Left Side: Bet Amount Controls */}
        <div className="flex flex-col gap-2 bg-[#0b1024] p-2 rounded-xl border border-white/5 w-[145px] shrink-0">
          <div className="flex items-center justify-between px-1">
            <button
              type="button"
              onClick={() => setBetAmount(Math.max(10, betAmount - 10))}
              disabled={isCurrentlyActiveBet || loading}
              className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 border border-gray-600 flex items-center justify-center text-gray-200 disabled:opacity-30 transition-colors"
              aria-label="Decrease bet"
            >
              <Minus size={12} />
            </button>
            <input
              type="number"
              value={betAmount || ''}
              onChange={(e) => setBetAmount(Math.max(0, Number(e.target.value)))}
              disabled={isCurrentlyActiveBet || loading}
              className="bg-transparent text-center font-black text-sm text-white focus:outline-none w-[56px] tabular-nums"
              min={10}
              max={10000}
            />
            <button
              type="button"
              onClick={() => setBetAmount(Math.min(10000, betAmount + 10))}
              disabled={isCurrentlyActiveBet || loading}
              className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 border border-gray-600 flex items-center justify-center text-gray-200 disabled:opacity-30 transition-colors"
              aria-label="Increase bet"
            >
              <Plus size={12} />
            </button>
          </div>

          <div className="flex flex-wrap gap-1 px-0.5 justify-center">
            {quickBets.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setBetAmount(val)}
                disabled={isCurrentlyActiveBet || loading}
                className={`px-2 py-1 rounded-md text-[10px] font-black border transition-all ${
                  betAmount === val
                    ? 'bg-[#4aa4ff] text-white border-blue-400 shadow-[0_0_10px_rgba(74,164,255,0.4)]'
                    : 'bg-[#1b233d] text-gray-300 border-white/5 hover:bg-white/10'
                } disabled:opacity-40`}
              >
                ₹{val}
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Bet / Cashout Action Button */}
        <div className="flex-1 h-[84px]">
          {canCashOutNow ? (
            <button
              type="button"
              onClick={onCashout}
              className="w-full h-full bg-[#f4b400] hover:bg-[#ffc107] active:bg-[#e0a800] text-black rounded-2xl flex flex-col items-center justify-center transition-all shadow-[0_6px_20px_rgba(244,180,0,0.4)] active:scale-95 border-b-4 border-[#c79100]"
            >
              <span className="text-[11px] font-black uppercase tracking-widest text-black/80">CASH OUT</span>
              <span className="text-2xl font-black tabular-nums tracking-tight">{multiplier.toFixed(2)}x</span>
              <span className="text-xs font-black">{formatINR(betAmount * multiplier)}</span>
            </button>
          ) : isCurrentlyActiveBet ? (
            <div className="w-full h-full rounded-2xl flex flex-col items-center justify-center bg-[#b91c1c]/90 border border-red-500/40 text-white shadow-lg select-none">
              <span className="text-base font-black uppercase tracking-wider text-white">
                BET LOCKED
              </span>
              <span className="text-xs font-bold text-red-200 mt-0.5">
                {formatINR(betAmount)} · In Play
              </span>
            </div>
          ) : hasInsufficientBalance ? (
            <button
              type="button"
              onClick={() => onPlaceBet(betAmount)}
              className="w-full h-full rounded-2xl flex flex-col items-center justify-center bg-[#4a1525] border border-red-500/30 text-red-300 cursor-pointer transition-all active:scale-95"
            >
              <span className="text-sm font-black uppercase tracking-tight text-red-300">LOW BALANCE</span>
              <span className="text-[11px] font-bold text-red-400 mt-0.5">Deposit to play ₹{betAmount}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onPlaceBet(betAmount)}
              disabled={loading || (!bettingOpen && isAuthenticated)}
              className={`w-full h-full rounded-2xl flex flex-col items-center justify-center transition-all shadow-lg active:scale-95 ${
                (bettingOpen || !isAuthenticated) && betAmount >= 10
                  ? 'bg-[#28a745] hover:bg-[#218838] active:bg-[#1e7e34] text-white border-b-4 border-[#1e7e34] shadow-[0_6px_20px_rgba(40,167,69,0.35)]'
                  : 'bg-[#242e4d] text-gray-400 border-b-4 border-[#1c1c1e] cursor-not-allowed opacity-85'
              }`}
            >
              <span className="text-2xl font-black uppercase tracking-tighter">
                {loading ? 'WAIT…' : !isAuthenticated ? 'LOGIN TO BET' : bettingOpen ? 'BET' : 'WAIT FOR ROUND'}
              </span>
              <span className="text-xs font-black opacity-90">
                {betAmount >= 10 ? `${formatINR(betAmount)}` : 'Min ₹10'}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AviatorControls;
