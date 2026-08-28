import React from 'react';
import { motion } from 'framer-motion';

const WheelControls = ({
  betAmount,
  setBetAmount,
  balance,
  onSpin,
  isSpinning,
  risk,
  setRisk
}) => {
  const riskOptions = ['low', 'medium', 'high'];

  return (
    <div className="bg-[#242E4D] p-6 rounded-3xl shadow-2xl border border-white/5 space-y-6 flex flex-col justify-center">
      {/* Risk Selector */}
      <div className="space-y-2">
        <label className="text-xs font-black text-gray-400 uppercase tracking-widest block ml-1">
          Risk Level
        </label>
        <div className="grid grid-cols-3 gap-2">
          {riskOptions.map((option) => (
            <button
              key={option}
              onClick={() => setRisk(option)}
              disabled={isSpinning}
              className={`py-2.5 rounded-xl text-xs font-black transition-all border uppercase
                ${risk === option
                  ? 'bg-[#E60000] border-[#FFD700] text-white shadow-lg shadow-red-600/20'
                  : 'bg-[#1B233D] border-white/5 text-gray-400 hover:text-gray-200'
                }
                ${isSpinning ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {option.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Bet Amount */}
      <div className="space-y-2">
        <label className="text-xs font-black text-gray-500 uppercase tracking-widest block ml-1">
          Bet Amount
        </label>
        <div className="flex items-center gap-3 bg-[#0B0F2A] rounded-xl p-2 border border-white/5 shadow-inner">
          <button
            onClick={() => setBetAmount(Math.max(10, betAmount - 10))}
            disabled={isSpinning}
            className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-gray-400 hover:bg-white/5"
          >
            -
          </button>
          <input
            type="number"
            value={betAmount}
            onChange={(e) => setBetAmount(Math.max(0, Number(e.target.value)))}
            disabled={isSpinning}
            className="flex-1 bg-transparent text-center font-black text-lg text-white focus:outline-none"
          />
          <button
            onClick={() => setBetAmount(betAmount + 10)}
            disabled={isSpinning}
            className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-gray-400 hover:bg-white/5"
          >
            +
          </button>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[10, 50, 100, 500].map((val) => (
            <button
              key={val}
              onClick={() => setBetAmount(val)}
              disabled={isSpinning}
              className="py-2 rounded-lg bg-[#0B0F2A] border border-white/5 text-[10px] font-black text-gray-400 hover:text-white transition-all disabled:opacity-50"
            >
              ₹{val}
            </button>
          ))}
        </div>
      </div>

      {/* Spin Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onSpin(betAmount)}
        disabled={isSpinning || betAmount <= 0 || betAmount > balance}
        className={`w-full py-4 rounded-xl font-black text-lg uppercase tracking-wider transition-all shadow-xl
          ${isSpinning || betAmount <= 0 || betAmount > balance
            ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-b from-[#FF5C38] to-[#E60000] border-2 border-[#FFD700]/50 text-white shadow-red-600/30'
          }
        `}
      >
        {isSpinning ? 'Spinning...' : 'Spin Wheel'}
      </motion.button>
    </div>
  );
};

export default WheelControls;
