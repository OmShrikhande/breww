import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Info, Wallet, Timer, CheckCircle2 } from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';

// Layout & Components
import GameLayout from '../GameLayout';
import ColorBoard from './ColorBoard';
import SizeBoard from './SizeBoard';
import NumberBoard from './NumberBoard';
import HistoryTable from './HistoryTable';

// Hooks & Utils
import { useWallet } from '../../hooks/useWallet';
import { useBets } from '../../hooks/useBets';
import { formatINR } from '../../utils/formatCurrency';
import { getColorClass } from '../../utils/gameHelpers';
import { generateResult, evaluateBets } from '../../engines/predictionEngine';

const generatePreviewPeriod = () => Date.now().toString();

const ColorPrediction = () => {
  const { balance } = useWallet();
  const { bets, addBet, clearBets } = useBets();

  // Timer and Period state
  const [timeLeft, setTimeLeft] = useState(30);
  const [period, setPeriod] = useState(() => generatePreviewPeriod());

  // Local state
  const [selectedBet, setSelectedBet] = useState(null); // { type, value }
  const [gameHistory, setGameHistory] = useState([]);
  const [currentRoundResult, setCurrentRoundResult] = useState(null);
  const [isResultRevealing, setIsResultRevealing] = useState(false);
  const [showBetSuccess, setShowBetSuccess] = useState(false);
  const [totalWinAmount, setTotalWinAmount] = useState(0);
  const [resolvedBetCount, setResolvedBetCount] = useState(0);

  const betsRef = useRef([]);

  useEffect(() => {
    betsRef.current = bets;
  }, [bets]);

  const handleReveal = useCallback(() => {
    setIsResultRevealing(true);
    
    // 1. Generate Result using Engine
    const result = generateResult();
    const currentPeriod = period;

    // 2. Wait for animation (2s)
    setTimeout(() => {
      const newResult = {
        period: currentPeriod,
        ...result
      };

      setCurrentRoundResult(newResult);
      setGameHistory(prev => [newResult, ...prev].slice(0, 10));
      
      // 3. Evaluate All Bets using Engine
      const currentBets = betsRef.current;
      const { totalWon } = evaluateBets(currentBets, result);
      setResolvedBetCount(currentBets.length);

      setTotalWinAmount(totalWon);

      // 4. Cleanup and Reset for next round after 3 more seconds
      setTimeout(() => {
        setIsResultRevealing(false);
        setCurrentRoundResult(null);
        clearBets();
        setTotalWinAmount(0);
        setResolvedBetCount(0);
        setSelectedBet(null);
        setPeriod(generatePreviewPeriod());
        setTimeLeft(30);
      }, 3000);
    }, 2000);
  }, [period, clearBets]);

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

  const handleBetClick = (amount) => {
    if (!selectedBet) return;
    if (amount <= 0) return;
    if (timeLeft <= 5) return;

    addBet({ ...selectedBet, amount, source: 'frontend-preview' });
    setShowBetSuccess(true);
    setTimeout(() => setShowBetSuccess(false), 2000);
  };

  const isBettingDisabled = timeLeft <= 5 || isResultRevealing;

  return (
    <GameLayout title="WinGo 30s" onPlaceBet={handleBetClick} betDisabled={isBettingDisabled}>
      <div className="flex flex-col gap-4">
        
        {/* Header Section */}
        <div className="bg-casino-card rounded-2xl p-5 border border-white/5 shadow-2xl relative overflow-hidden mb-2">
          <div className="flex justify-between items-start relative z-10">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="bg-orange-500/10 text-orange-500 p-1 rounded-md text-[10px] font-bold border border-orange-500/20 flex items-center gap-1">
                  <Info size={12} />
                  How to play
                </div>
                <div className="bg-sky-500/10 text-sky-300 p-1 rounded-md text-[10px] font-bold border border-sky-400/20">
                  Preview Only
                </div>
              </div>
              
              <div className="flex flex-col">
                <h1 className="text-sm font-bold text-gray-400 uppercase tracking-wider">WinGo 30sec</h1>
                <div className="flex gap-1.5 mt-2">
                  {gameHistory.slice(0, 5).map((h, i) => (
                    <div key={i} className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-lg ${getColorClass(h.color)}`}>
                      {h.number}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-end">
              <div className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2">Time Remaining</div>
              <div className="flex items-center gap-1">
                {[0, 0].map((n, i) => (
                  <div key={i} className="bg-[#f0f0f0] text-[#333] w-7 h-10 flex items-center justify-center rounded-lg font-black text-xl shadow-inner">
                    {n}
                  </div>
                ))}
                <span className="text-white font-black text-2xl mx-0.5">:</span>
                {[Math.floor(timeLeft / 10), timeLeft % 10].map((n, i) => (
                  <div key={i} className="bg-[#f0f0f0] text-[#333] w-7 h-10 flex items-center justify-center rounded-lg font-black text-xl shadow-inner">
                    {n}
                  </div>
                ))}
              </div>
              <div className="mt-3 text-white font-mono text-sm font-black tracking-tight">{period}</div>
            </div>
          </div>
        </div>

        {/* Balance Section */}
        <div className="bg-[#1e254a] rounded-2xl p-4 border border-white/5 shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-xl text-green-400">
              <Wallet size={20} />
            </div>
            <div>
              <div className="text-gray-400 text-[10px] font-bold uppercase">Quick Deposit</div>
              <div className="text-lg font-black text-white">{formatINR(balance)}</div>
            </div>
          </div>
          <button className="bg-casino-accent px-4 py-2 rounded-xl text-xs font-bold hover:scale-105 transition-all shadow-lg active:scale-95">
            Deposit
          </button>
        </div>

        {/* Betting Boards - OPTION B (Multiple sections on one screen) */}
        <div className={`space-y-4 transition-opacity ${isBettingDisabled ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="bg-casino-card rounded-2xl p-4 border border-white/5 shadow-xl">
             <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Color Betting</div>
             <ColorBoard selectedBet={selectedBet} onSelectBet={setSelectedBet} disabled={isBettingDisabled} />
          </div>

          <div className="bg-casino-card rounded-2xl p-4 border border-white/5 shadow-xl">
             <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Size Betting</div>
             <SizeBoard selectedBet={selectedBet} onSelectBet={setSelectedBet} disabled={isBettingDisabled} />
          </div>

          <div className="bg-casino-card rounded-2xl p-4 border border-white/5 shadow-xl">
             <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Number Betting</div>
             <NumberBoard selectedBet={selectedBet} onSelectBet={setSelectedBet} disabled={isBettingDisabled} />
          </div>
        </div>

        {/* Game History */}
        <HistoryTable gameHistory={gameHistory} />

        {/* Countdown Overlay for last 5 seconds */}
        <AnimatePresence>
          {timeLeft <= 5 && timeLeft > 0 && !isResultRevealing && (
            <Motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-[2px] pointer-events-none"
            >
              <div className="flex gap-4">
                {[0, timeLeft].map((digit, i) => (
                  <Motion.div
                    key={`${i}-${digit}`}
                    initial={{ y: 50, opacity: 0, scale: 0.5 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    className="w-32 h-48 bg-[#f0f0f0] rounded-[2rem] flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-b-8 border-gray-300"
                  >
                    <span className="text-[120px] font-black text-[#c09a75] leading-none">
                      {digit}
                    </span>
                  </Motion.div>
                ))}
              </div>
            </Motion.div>
          )}
        </AnimatePresence>

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

        {/* Result Reveal Animation Overlay */}
        <AnimatePresence>
          {isResultRevealing && (
            <Motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6"
            >
              <div className="w-full max-w-sm flex flex-col items-center">
                <Motion.div
                  initial={{ y: -50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-casino-accent text-xs font-black uppercase tracking-[0.3em] mb-12"
                >
                  Winning Number
                </Motion.div>

                {/* Number Cards Animation */}
                <div className="flex gap-4 mb-12">
                  {[0, 1].map((index) => (
                    <Motion.div
                      key={index}
                      animate={{ 
                        rotateY: currentRoundResult ? 0 : [0, 180, 360, 540, 720],
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: currentRoundResult ? 0 : Infinity,
                        ease: "easeInOut"
                      }}
                      className="w-24 h-36 bg-[#141A3C] rounded-2xl border-2 border-white/10 flex items-center justify-center shadow-2xl"
                    >
                      <div className="text-6xl font-black italic text-white">
                        {currentRoundResult ? (index === 0 ? '0' : currentRoundResult.number) : '?'}
                      </div>
                    </Motion.div>
                  ))}
                </div>

                {/* Final Result Display */}
                <AnimatePresence>
                  {currentRoundResult && (
                    <Motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="flex flex-col items-center"
                    >
                      <div className={`text-7xl font-black italic mb-6 ${getColorClass(currentRoundResult.color).replace('bg-', 'text-')}`}>
                        {currentRoundResult.number}
                      </div>
                      
                      <div className="flex gap-3 mb-8">
                        <span className={`px-6 py-2 rounded-xl text-xs font-black uppercase text-white ${getColorClass(currentRoundResult.color)}`}>
                          {currentRoundResult.color}
                        </span>
                        <span className={`px-6 py-2 rounded-xl text-xs font-black uppercase text-white ${getColorClass(currentRoundResult.size)}`}>
                          {currentRoundResult.size}
                        </span>
                      </div>

                      {totalWinAmount > 0 ? (
                        <Motion.div 
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 1 }}
                          className="text-center"
                        >
                          <div className="text-green-400 font-black text-3xl uppercase italic drop-shadow-[0_0_10px_rgba(74,222,128,0.5)]">YOU WIN!</div>
                          <div className="text-white text-4xl font-black mt-2">
                            +₹{totalWinAmount.toFixed(0)}
                          </div>
                          <div className="text-gray-400 text-[10px] font-bold mt-1 uppercase tracking-widest">
                            From {resolvedBetCount} active bets
                          </div>
                        </Motion.div>
                      ) : resolvedBetCount > 0 ? (
                        <div className="text-red-500 font-black text-xl uppercase opacity-50 italic">Better Luck Next Time</div>
                      ) : null}
                    </Motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Motion.div>
          )}
        </AnimatePresence>
      </div>
    </GameLayout>
  );
};

export default ColorPrediction;
