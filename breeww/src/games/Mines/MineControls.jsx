import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, RefreshCw, Play } from 'lucide-react';

const MineControls = ({
  gameStatus,
  betAmount,
  setBetAmount,
  mineCount,
  setMineCount,
  onStart,
  onCashout,
  revealedCount,
  multiplier,
  balance
}) => {
  const isPlaying = gameStatus === 'playing';

  return (
    <div className="bg-[#0f3f91] border border-white/10 rounded-2xl p-3 space-y-3">
      <div className="flex justify-between text-xs text-white uppercase tracking-[0.12em] font-black">
        <div className="flex items-center gap-1">
          <span className="bg-blue-700 px-2 py-1 rounded-full">Mines: {mineCount}</span>
        </div>
        <div className="bg-yellow-400 text-black px-2 py-1 rounded-full">Next: {multiplier.toFixed(2)}x</div>
      </div>

      <div className="bg-[#0c2f84] rounded-xl p-2 grid grid-cols-3 gap-2 items-center">
        <div className="col-span-1 bg-[#0d4ac4] rounded-xl p-2 text-center text-white font-black">Bet INR</div>
        <div className="col-span-1 bg-[#0f2f70] rounded-xl p-2 text-center text-white font-black">{(betAmount/100).toFixed(2)}</div>
        <div className="col-span-1 flex justify-end gap-1">
          <button onClick={() => setBetAmount(Math.max(10, betAmount - 10))} className="w-8 h-8 rounded-lg bg-[#1b4bbf] flex items-center justify-center text-white"><Minus size={14} /></button>
          <button onClick={() => setBetAmount(Math.min(balance, betAmount + 10))} className="w-8 h-8 rounded-lg bg-[#1b4bbf] flex items-center justify-center text-white"><Plus size={14} /></button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <button onClick={() => setMineCount(mineCount === 10 ? 1 : mineCount + 1)} className="w-10 h-10 rounded-full bg-[#0d4ac4] flex items-center justify-center text-white"><RefreshCw size={16} /></button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={isPlaying ? onCashout : () => onStart(betAmount)}
          disabled={isPlaying ? revealedCount === 0 : betAmount <= 0 || betAmount > balance}
          className={`flex-1 py-3 rounded-2xl font-black text-lg uppercase tracking-wide transition-all ${
            isPlaying
              ? (revealedCount === 0 ? 'bg-gray-700 text-gray-300 cursor-not-allowed' : 'bg-lime-500 text-black hover:bg-lime-400')
              : (betAmount <= 0 || betAmount > balance ? 'bg-gray-700 text-gray-300 cursor-not-allowed' : 'bg-[#2fa719] text-white hover:bg-[#36ce1f]')
          }
          flex items-center justify-center gap-2`}
        >
          <Play size={16} />
          {isPlaying ? (revealedCount === 0 ? 'Pick a tile' : `Cash Out ₹${(betAmount * multiplier).toFixed(0)}`) : 'Bet'}
        </motion.button>
      </div>
    </div>
  );
};

export default MineControls;
