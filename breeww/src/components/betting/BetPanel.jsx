import React, { useState } from 'react';
import { useWallet } from '../../context/WalletContext';

const BetPanel = ({ onPlaceBet, disabled }) => {
  const { balance } = useWallet();
  const [amount, setAmount] = useState(10);
  const quickBets = [10, 50, 100, 500];

  const handleBet = () => {
    if (amount > 0 && amount <= balance) {
      onPlaceBet(amount);
    }
  };

  return (
    <div className="bg-casino-card p-4 rounded-t-2xl border-t border-gray-800 shadow-2xl">
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1 bg-gray-900 rounded-xl p-3 border border-gray-700 flex items-center justify-between">
          <button 
            onClick={() => setAmount(Math.max(10, amount - 10))}
            className="text-gray-400 font-bold px-2"
          >
            -
          </button>
          <input 
            type="number" 
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="bg-transparent text-center font-mono font-bold text-lg w-20 focus:outline-none"
          />
          <button 
            onClick={() => setAmount(amount + 10)}
            className="text-gray-400 font-bold px-2"
          >
            +
          </button>
        </div>
        <button 
          onClick={handleBet}
          disabled={disabled || amount > balance || amount <= 0}
          className={`flex-[1.5] py-4 rounded-xl font-black text-lg uppercase transition-all active:scale-95 ${
            disabled || amount > balance || amount <= 0
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-500 text-white shadow-[0_4px_0_rgb(22,101,52)]'
          }`}
        >
          Place Bet
        </button>
      </div>

      <div className="flex justify-between gap-2">
        {quickBets.map((val) => (
          <button
            key={val}
            onClick={() => setAmount(val)}
            className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${
              amount === val 
                ? 'bg-casino-accent/20 border-casino-accent text-casino-accent' 
                : 'bg-gray-800/50 border-gray-700 text-gray-400'
            }`}
          >
            ₹{val}
          </button>
        ))}
      </div>
    </div>
  );
};

export default BetPanel;
