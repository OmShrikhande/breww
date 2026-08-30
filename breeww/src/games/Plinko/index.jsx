import React, { useState, useCallback, useMemo, useRef } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { Wallet, History, CheckCircle2, Info } from 'lucide-react';
import GameLayout from '../GameLayout';
import { useAuth } from '../../context/AuthContext';
import { navigateTo } from '../../lib/navigation';
import { useWallet } from '../../hooks/useWallet';
import { useBets } from '../../hooks/useBets';
import { formatINR } from '../../utils/formatCurrency';
import PlinkoBoard from './PlinkoBoard';
import PlinkoControls from './PlinkoControls';

const Plinko = () => {
  const { isAuthenticated } = useAuth();
  const { balance } = useWallet();
  const { addBet, clearBets } = useBets();
  const boardRef = useRef(null);

  const [rows, setRows] = useState(8);
  const [risk, setRisk] = useState('low');
  const [betAmount, setBetAmount] = useState(100);
  const [gameHistory, setGameHistory] = useState([]);
  const [lastWin, setLastWin] = useState(null);

  // Define multipliers based on risk and rows
  const multipliers = useMemo(() => {
    const baseMultipliers = {
      low: [5.6, 2.1, 1.1, 1, 0.5, 1, 1.1, 2.1, 5.6],
      medium: [13, 3, 1.3, 0.7, 0.4, 0.7, 1.3, 3, 13],
      high: [29, 4, 1.5, 0.3, 0.2, 0.3, 1.5, 4, 29],
    };

    const currentMultipliers = baseMultipliers[risk];
    const targetLength = rows + 1;

    if (currentMultipliers.length === targetLength) return currentMultipliers;

    // Distribute multipliers to fit the number of rows
    const result = new Array(targetLength).fill(0);
    const center = Math.floor(targetLength / 2);

    for (let i = 0; i < targetLength; i++) {
      const distFromCenter = Math.abs(i - center);
      const ratio = distFromCenter / center;
      const maxMult = currentMultipliers[0];
      const minMult = currentMultipliers[center];

      result[i] = parseFloat((minMult + (maxMult - minMult) * Math.pow(ratio, 2)).toFixed(1));
    }

    return result;
  }, [rows, risk]);

  const handleDropBall = useCallback((amount) => {
    if (!isAuthenticated) {
      navigateTo('/login');
      return;
    }
    if (amount <= 0) return;

    boardRef.current.dropBall();
    addBet({
      type: 'plinko-preview',
      amount,
      risk,
      rows,
      source: 'frontend-preview'
    });
  }, [risk, rows, addBet]);

  const handleBallLand = useCallback((multiplier) => {
    const winAmount = betAmount * multiplier;
    if (winAmount > 0) {
      setLastWin(winAmount);
      setTimeout(() => setLastWin(null), 3000);
    }

    setGameHistory((prev) => [
      {
        id: Date.now(),
        multiplier,
        risk,
        rows,
        outcome: multiplier >= 1 ? 'Win' : 'Loss',
        profit: winAmount - betAmount,
      },
      ...prev,
    ].slice(0, 10));

    // Cleanup bets after some time
    setTimeout(() => clearBets(), 2000);
  }, [betAmount, risk, rows, clearBets]);

  return (
    <GameLayout title="PLINKO" isWide={true}>
      <div className="flex flex-col gap-6 w-full px-4 pt-4 pb-10">
        
        {/* Balance Section */}
        <div className="bg-[#141A3C]/80 backdrop-blur-md rounded-2xl p-6 border border-white/5 shadow-2xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-green-500/10 rounded-2xl text-green-400 border border-green-500/20 shadow-inner">
              <Wallet size={32} />
            </div>
            <div>
              <div className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">Your Balance</div>
              <div className="text-3xl font-black text-white">{formatINR(balance)}</div>
            </div>
          </div>
          <div className="rounded-full border border-sky-400/20 bg-sky-400/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-sky-200">
            Preview Only
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr,0.8fr] gap-8">
          {/* Game Board Side */}
          <div className="order-2 lg:order-1 flex items-center justify-center">
            <PlinkoBoard 
              ref={boardRef}
              rows={rows} 
              risk={risk} 
              onBallLand={handleBallLand}
              multipliers={multipliers}
            />
          </div>

          {/* Controls Side */}
          <div className="order-1 lg:order-2">
            <PlinkoControls 
              rows={rows}
              setRows={setRows}
              risk={risk}
              setRisk={setRisk}
              betAmount={betAmount}
              setBetAmount={setBetAmount}
              balance={balance}
              onDropBall={handleDropBall}
            />
          </div>
        </div>

        {/* Win Notification Overlay */}
        <AnimatePresence>
          {lastWin && (
            <Motion.div
              initial={{ scale: 0.5, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.5, opacity: 0, y: -20 }}
              className="fixed inset-0 pointer-events-none flex items-center justify-center z-50"
            >
              <div className="bg-green-600 px-12 py-6 rounded-3xl shadow-[0_0_50px_rgba(22,163,74,0.5)] border-2 border-green-400 text-center">
                <div className="text-white text-sm font-black uppercase tracking-widest mb-1">Big Win!</div>
                <div className="text-4xl font-black text-white italic tracking-tighter">
                  {formatINR(lastWin)}
                </div>
              </div>
            </Motion.div>
          )}
        </AnimatePresence>

        {/* History Table */}
        <div className="bg-[#141A3C] rounded-2xl border border-white/5 shadow-xl overflow-hidden mt-4">
          <div className="p-4 border-b border-white/5 flex items-center gap-2 bg-white/5">
            <History size={16} className="text-casino-accent" />
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-300">Game History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-[10px] font-black text-gray-500 uppercase tracking-widest bg-black/20">
                  <th className="px-5 py-3">Rows</th>
                  <th className="px-5 py-3">Risk</th>
                  <th className="px-5 py-3">Multiplier</th>
                  <th className="px-5 py-3 text-right">Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {gameHistory.length > 0 ? (
                  gameHistory.map((h) => (
                    <tr key={h.id} className="text-xs font-bold text-gray-300 hover:bg-white/5 transition-colors">
                      <td className="px-5 py-3">
                        <span className="bg-gray-800 px-2 py-1 rounded text-[10px]">
                          {h.rows} Rows
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-1 rounded text-[10px] uppercase ${
                          h.risk === 'high' ? 'bg-red-500/10 text-red-500' : 
                          h.risk === 'medium' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-green-500/10 text-green-500'
                        }`}>
                          {h.risk}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`font-black ${h.multiplier >= 1 ? 'text-green-500' : 'text-gray-500'}`}>
                          {h.multiplier}x
                        </span>
                      </td>
                      <td className={`px-5 py-3 text-right font-black ${h.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {h.profit >= 0 ? '+' : ''}{h.profit.toFixed(0)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-5 py-10 text-center text-gray-600 italic">
                      No game history yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </GameLayout>
  );
};

export default Plinko;
