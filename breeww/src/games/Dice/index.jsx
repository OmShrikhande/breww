import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { Wallet, Info, History, Timer, ChevronDown, ChevronUp, RotateCcw, CheckCircle2 } from 'lucide-react';
import GameLayout from '../GameLayout';
import { useBets } from '../../hooks/useBets';

const SUM_MULTIPLIERS = {
  3: 207.36, 4: 69.12, 5: 34.56, 6: 20.74, 7: 13.83, 8: 9.88, 9: 8.3, 10: 7.68,
  11: 7.68, 12: 8.3, 13: 9.88, 14: 13.83, 15: 20.74, 16: 34.56, 17: 69.12, 18: 207.36
};

const DiceIcon = ({ value, className = "" }) => {
  const dots = [
    [],
    [4],
    [0, 8],
    [0, 4, 8],
    [0, 2, 6, 8],
    [0, 2, 4, 6, 8],
    [0, 2, 3, 5, 6, 8]
  ];

  return (
    <div className={`w-12 h-12 bg-red-600 rounded-lg shadow-lg relative p-2 ${className}`}>
      <div className="grid grid-cols-3 grid-rows-3 gap-1 h-full w-full">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="flex items-center justify-center">
            {dots[value].includes(i) && (
              <div className="w-2 h-2 bg-yellow-400 rounded-full shadow-sm" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const Dice = () => {
  const { bets, addBet, clearBets } = useBets();

  // Local state
  const [timeLeft, setTimeLeft] = useState(30);
  const [isRolling, setIsRolling] = useState(false);
  const [diceResults, setDiceResults] = useState([1, 1, 1]);
  const [gameHistory, setGameHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('Total'); // Total, 2 same, 3 same, Different
  const [selectedBets, setSelectedBets] = useState([]); // Array of { type, value, multiplier }
  const [showBetSuccess, setShowBetSuccess] = useState(false);

  const periodId = useMemo(() => {
    const now = new Date();
    return now.getFullYear().toString() + 
           (now.getMonth() + 1).toString().padStart(2, '0') + 
           now.getDate().toString().padStart(2, '0') + 
           now.getHours().toString().padStart(2, '0') + 
           now.getMinutes().toString().padStart(2, '0') + 
           "0489"; // Mock suffix
  }, []);

  const handleReveal = useCallback(() => {
    setIsRolling(true);
    
    // Simulate roll animation duration
    setTimeout(() => {
      const newDice = [
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1
      ];
      setDiceResults(newDice);
      const sum = newDice.reduce((a, b) => a + b, 0);
      const isBig = sum >= 11;
      const isEven = sum % 2 === 0;

      // Evaluate bets
      let _totalWon = 0;
      bets.forEach(bet => {
        let win = false;
        if (bet.type === 'sum' && bet.value === sum) win = true;
        if (bet.type === 'size' && bet.value === (isBig ? 'Big' : 'Small')) win = true;
        if (bet.type === 'parity' && bet.value === (isEven ? 'Even' : 'Odd')) win = true;
        
        if (win) {
          _totalWon += bet.amount * bet.multiplier;
        }
      });

      setGameHistory(prev => [{
        id: Date.now(),
        period: periodId,
        sum,
        results: newDice,
        size: isBig ? 'Big' : 'Small',
        parity: isEven ? 'Even' : 'Odd'
      }, ...prev].slice(0, 10));

      setIsRolling(false);
      clearBets();
      setTimeLeft(30);
    }, 2000);
  }, [bets, periodId, clearBets]);

  // Timer logic
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === 1) {
          handleReveal();
          return 0;
        }
        if (prev <= 0) return 30;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [handleReveal]);

  const handlePlaceBet = (amount) => {
    if (amount <= 0) return;
    if (selectedBets.length === 0) return;

    selectedBets.forEach(bet => {
      addBet({
        ...bet,
        amount,
        source: 'frontend-preview'
      });
    });
    setSelectedBets([]);
    setShowBetSuccess(true);
    setTimeout(() => setShowBetSuccess(false), 2000);
  };

  const toggleBetSelection = (type, value, multiplier) => {
    const existingIndex = selectedBets.findIndex(b => b.type === type && b.value === value);
    if (existingIndex > -1) {
      setSelectedBets(prev => prev.filter((_, i) => i !== existingIndex));
    } else {
      setSelectedBets(prev => [...prev, { type, value, multiplier }]);
    }
  };

  return (
    <GameLayout title="DICE" isWide={false} onPlaceBet={handlePlaceBet} betDisabled={timeLeft <= 5 || isRolling}>
      <div className="flex flex-col gap-4 max-w-md mx-auto pb-10">
        
        {/* Game Board */}
        <div className="bg-[#141A3C] rounded-3xl p-6 border border-white/5 shadow-2xl relative overflow-hidden flex flex-col items-center">
          <div className="flex justify-between w-full mb-6">
            <div className="flex flex-col">
              <span className="text-gray-500 text-[10px] font-bold uppercase">Period</span>
              <span className="text-white font-black text-sm">{periodId}</span>
            </div>
            <div className="rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-sky-200">
              Preview
            </div>
            <div className="flex flex-col items-end">
              <span className="text-gray-500 text-[10px] font-bold uppercase">Time remaining</span>
              <div className="flex gap-1">
                {[0, 0].map((n, i) => (
                  <div key={i} className="bg-white/5 px-2 py-1 rounded text-white font-black text-xl">
                    {n}
                  </div>
                ))}
                <span className="text-white font-black text-xl mx-1">:</span>
                {[Math.floor(timeLeft / 10), timeLeft % 10].map((n, i) => (
                  <div key={i} className="bg-white/5 px-2 py-1 rounded text-white font-black text-xl">
                    {n}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-green-900/40 rounded-3xl p-8 border-4 border-green-600/50 shadow-inner flex gap-6 relative">
            {/* Slot-like frame */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/20 pointer-events-none" />
            <div className="flex items-center gap-4">
              <AnimatePresence initial={false} mode="sync">
                {diceResults.map((val, i) => (
                    <Motion.div
                      key={`${i}-${val}-${isRolling}`}
                    initial={isRolling ? { y: -20, opacity: 0 } : { y: 0, opacity: 1 }}
                    animate={isRolling ? { 
                      y: [0, -50, 50, 0], 
                      rotate: [0, 90, 180, 270, 360],
                      opacity: 1
                    } : { y: 0, opacity: 1 }}
                    transition={isRolling ? { 
                      duration: 0.2, 
                      repeat: Infinity, 
                      ease: "linear" 
                    } : { duration: 0.5, type: 'spring' }}
                  >
                      <DiceIcon value={isRolling ? ((i % 6) + 1) : val} />
                  </Motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Betting Panel */}
        <div className="bg-[#141A3C] rounded-3xl border border-white/5 shadow-2xl overflow-hidden">
          <div className="flex border-b border-white/5">
            {['Total', '2 same', '3 same', 'Different'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 text-xs font-black uppercase transition-all ${
                  activeTab === tab ? 'bg-orange-500 text-white' : 'text-gray-500 hover:bg-white/5'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'Total' && (
              <div className="flex flex-col gap-6">
                {/* Numbers Grid */}
                <div className="grid grid-cols-4 gap-4">
                  {Object.entries(SUM_MULTIPLIERS).map(([sum, mult]) => (
                    <button
                      key={sum}
                      onClick={() => toggleBetSelection('sum', parseInt(sum), mult)}
                      className={`relative flex flex-col items-center p-3 rounded-2xl transition-all border-2 ${
                        selectedBets.find(b => b.type === 'sum' && b.value === parseInt(sum))
                          ? 'bg-red-600 border-red-400 shadow-lg shadow-red-600/30'
                          : 'bg-[#0B0F2A] border-white/5 hover:border-white/20'
                      }`}
                    >
                      <span className="text-[10px] text-gray-500 font-bold mb-1">{mult}X</span>
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-black ${
                        parseInt(sum) % 2 === 0 ? 'border-green-500 text-green-500' : 'border-red-500 text-red-500'
                      }`}>
                        {sum}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Big/Small Grid */}
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: 'Small', val: 'Small', color: 'bg-blue-500' },
                    { label: 'Big', val: 'Big', color: 'bg-orange-500' },
                    { label: 'Even', val: 'Even', color: 'bg-green-500' },
                    { label: 'Odd', val: 'Odd', color: 'bg-red-500' }
                  ].map((b) => (
                    <button
                      key={b.label}
                      onClick={() => toggleBetSelection(b.val === 'Big' || b.val === 'Small' ? 'size' : 'parity', b.val, 2)}
                      className={`py-4 rounded-xl flex flex-col items-center transition-all border-2 ${
                        selectedBets.find(sb => sb.value === b.val)
                          ? `${b.color} border-white shadow-lg`
                          : `${b.color}/20 border-transparent text-white/80 hover:border-white/10`
                      }`}
                    >
                      <span className="text-sm font-black uppercase">{b.label}</span>
                      <span className="text-[10px] font-bold opacity-60">2X</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {activeTab !== 'Total' && (
              <div className="py-10 text-center text-gray-500 font-bold uppercase tracking-widest italic">
                Coming Soon in next update
              </div>
            )}
          </div>
        </div>

        {/* History Section */}
        <div className="bg-[#141A3C] rounded-3xl border border-white/5 shadow-xl overflow-hidden mb-10">
          <div className="flex bg-[#0B0F2A] p-1 m-4 rounded-xl border border-white/5">
            {['Game history', 'Chart', 'My history'].map((tab, i) => (
              <button key={tab} className={`flex-1 py-2 rounded-lg text-xs font-black uppercase transition-all ${i === 0 ? 'bg-orange-500 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>
                {tab}
              </button>
            ))}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[10px]">
              <thead>
                <tr className="bg-orange-900/20 text-orange-500 font-black uppercase tracking-widest">
                  <th className="px-4 py-3 text-left">Period</th>
                  <th className="px-4 py-3 text-center">Sum</th>
                  <th className="px-4 py-3 text-right">Results</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {gameHistory.length > 0 ? (
                  gameHistory.map((h) => (
                    <tr key={h.id} className="text-gray-300 font-bold hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3">{h.period}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-white font-black mr-2">{h.sum}</span>
                        <span className="text-[8px] opacity-60 uppercase">{h.size} | {h.parity}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          {h.results.map((val, i) => (
                            <div key={i} className="w-4 h-4 bg-red-600 rounded-sm flex items-center justify-center">
                              <div className="w-0.5 h-0.5 bg-yellow-400 rounded-full" />
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-4 py-12 text-center text-gray-600 italic">No history yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bet Success Toast */}
        <AnimatePresence>
          {showBetSuccess && (
            <Motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none"
            >
              <div className="bg-green-600 px-10 py-5 rounded-2xl shadow-[0_0_50px_rgba(34,197,94,0.5)] border border-green-400 font-black text-white uppercase tracking-widest flex items-center gap-3">
                <CheckCircle2 size={24} />
                Bet placed successfully
              </div>
            </Motion.div>
          )}
        </AnimatePresence>

      </div>
    </GameLayout>
  );
};

export default Dice;
