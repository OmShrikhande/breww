import React, { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { formatINR } from '../../utils/formatCurrency';

const AviatorControls = ({ betAmount, setBetAmount, onPlaceBet, onCashout, gameState, isBetPlaced, hasCashedOut, multiplier }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
      <BetPanel 
        betAmount={betAmount} 
        setBetAmount={setBetAmount} 
        onPlaceBet={onPlaceBet} 
        onCashout={onCashout} 
        gameState={gameState} 
        isBetPlaced={isBetPlaced}
        hasCashedOut={hasCashedOut} 
        multiplier={multiplier} 
      />
      <BetPanel 
        betAmount={betAmount} 
        setBetAmount={setBetAmount} 
        onPlaceBet={onPlaceBet} 
        onCashout={onCashout} 
        gameState={gameState} 
        isBetPlaced={isBetPlaced}
        hasCashedOut={hasCashedOut} 
        multiplier={multiplier} 
      />
    </div>
  );
};

const BetPanel = ({ betAmount, setBetAmount, onPlaceBet, onCashout, gameState, isBetPlaced, hasCashedOut, multiplier }) => {
  const [activeTab, setActiveTab] = useState('bet');
  const quickBets = [10, 100, 500, 1000];

  const canBet = (gameState === 'waiting' || gameState === 'running') && !isBetPlaced;
  const canCashout = gameState === 'running' && isBetPlaced && !hasCashedOut;

  return (
    <div className="bg-[#1b233d] p-3 rounded-2xl border border-white/5 shadow-2xl flex flex-col items-center">
      {/* Tabs */}
      <div className="flex bg-[#0b1024] rounded-full p-1 mb-4 w-[140px]">
        <button
          onClick={() => setActiveTab('bet')}
          className={`flex-1 py-1 rounded-full text-[9px] font-black uppercase transition-all ${
            activeTab === 'bet' ? 'bg-[#2d3a5e] text-white shadow-lg' : 'text-gray-500'
          }`}
        >
          Bet
        </button>
        <button
          onClick={() => setActiveTab('auto')}
          className={`flex-1 py-1 rounded-full text-[9px] font-black uppercase transition-all ${
            activeTab === 'auto' ? 'bg-[#2d3a5e] text-white shadow-lg' : 'text-gray-500'
          }`}
        >
          Auto
        </button>
      </div>

      <div className="flex items-center gap-2 w-full">
        {/* Left Side: Amount Controls */}
        <div className="flex flex-col gap-2 bg-[#0b1024] p-2 rounded-xl border border-white/5 w-[130px] shrink-0">
          <div className="flex items-center justify-between px-1">
            <button
              onClick={() => setBetAmount(Math.max(1, betAmount - 1))}
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
              onClick={() => setBetAmount(betAmount + 1)}
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
                onClick={() => setBetAmount(val)}
                disabled={!canBet}
                className="py-1 rounded-md bg-[#1b233d] text-[10px] font-black text-gray-300 border border-white/5"
              >
                {val}
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Action Button */}
        <div className="flex-1 h-[80px]">
          {canCashout ? (
            <button
              onClick={onCashout}
              className="w-full h-full bg-[#f4b400] hover:bg-[#ffc107] text-black rounded-xl flex flex-col items-center justify-center transition-all shadow-lg active:scale-95 border-b-4 border-[#c79100]"
            >
              <span className="text-[10px] font-black uppercase tracking-widest mb-1">Cash Out</span>
              <span className="text-xl font-black tabular-nums">{multiplier.toFixed(2)}x</span>
              <span className="text-xs font-black">
                {formatINR(betAmount * multiplier)}
              </span>
            </button>
          ) : (
            <button
              onClick={() => onPlaceBet(betAmount)}
              disabled={!canBet || betAmount <= 0}
              className={`w-full h-full rounded-2xl flex flex-col items-center justify-center transition-all shadow-lg active:scale-95 ${
                canBet && betAmount > 0
                  ? 'bg-[#28a745] hover:bg-[#218838] text-white border-b-4 border-[#1e7e34]'
                  : (isBetPlaced && !hasCashedOut) || gameState === 'running'
                    ? 'bg-[#b91c1c] text-white opacity-80 cursor-not-allowed border-b-4 border-[#991b1b]'
                    : 'bg-[#242e4d] text-gray-500 cursor-not-allowed border-b-4 border-[#1c1c1e]'
              }`}
            >
              <span className="text-2xl font-black uppercase tracking-tighter mb-0.5">
                {isBetPlaced && !hasCashedOut ? 'WAITING' : gameState === 'running' ? 'WAIT' : 'BET'}
              </span>
              <span className="text-xs font-black opacity-90">
                {betAmount > 0 ? `${betAmount.toFixed(2)} INR` : '0.00 INR'}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AviatorControls;
