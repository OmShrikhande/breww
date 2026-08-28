import React, { useState, useEffect, useCallback } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Menu } from 'lucide-react';
import GameLayout from '../GameLayout';
import { useWallet } from '../../hooks/useWallet';
import { useBets } from '../../hooks/useBets';
import { formatINR } from '../../utils/formatCurrency';
import AviatorGraph from './AviatorGraph';
import AviatorControls from './AviatorControls';
import AviatorHistory from './AviatorHistory';
import AviatorSidebar from './AviatorSidebar';

const Aviator = () => {
  const { balance } = useWallet();
  const { addBet } = useBets();

  // Game States
  const [gameState, setGameState] = useState('waiting'); // waiting, running, crashed
  const [multiplier, setMultiplier] = useState(1.0);
  const [crashAt, setCrashAt] = useState(0);
  const [history, setHistory] = useState([
    { id: 1, multiplier: 1.44 },
    { id: 2, multiplier: 1.56 },
    { id: 3, multiplier: 2.24 },
    { id: 4, multiplier: 1.00 },
    { id: 5, multiplier: 1.73 },
    { id: 6, multiplier: 1.14 },
    { id: 7, multiplier: 7.04 },
  ]);

  // Betting States
  const [betAmount, setBetAmount] = useState(10.00);
  const [hasCashedOut, setHasCashedOut] = useState(false);
  const [isBetPlaced, setIsBetPlaced] = useState(false);
  const [showBetSuccess, setShowBetSuccess] = useState(false);
  const [allBets, setAllBets] = useState(() => {
    const mockUsers = ['f***3', 'q***4', 'z***9', 's***1', 's***1', 'x***8', 'd***6', 'w***2'];
    return mockUsers.map((user, i) => ({
      id: i,
      user,
      amount: Math.floor(Math.random() * 5000) + 1000,
      hasCashedOut: i === 3,
      cashoutMult: i === 3 ? 1.01 : 0
    }));
  });

  // Game Loop Simulation
  useEffect(() => {
    let interval;
    if (gameState === 'running') {
      const startTime = Date.now();
      interval = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        const newMultiplier = Math.pow(Math.E, 0.08 * elapsed);
        
        if (newMultiplier >= crashAt) {
          setMultiplier(crashAt);
          setHistory(prev => [{ id: Date.now(), multiplier: crashAt }, ...prev].slice(0, 20));
          setGameState('crashed');
          clearInterval(interval);
        } else {
          setMultiplier(newMultiplier);
          
          setAllBets(prev => prev.map(bet => {
            if (!bet.hasCashedOut && Math.random() < 0.01 && newMultiplier > 1.2) {
              return { ...bet, hasCashedOut: true, cashoutMult: newMultiplier };
            }
            return bet;
          }));
        }
      }, 50);
    }

    if (gameState === 'waiting') {
      const timer = setTimeout(() => {
        const r = Math.random();
        const crash = 0.99 / (1 - r);
        setCrashAt(Math.max(1.0, crash));
        setGameState('running');
      }, 5000);
      return () => clearTimeout(timer);
    }

    if (gameState === 'crashed') {
      const timer = setTimeout(() => {
        setMultiplier(1.0);
        setHasCashedOut(false);
        setIsBetPlaced(false);
        setAllBets(prev => prev.map(bet => ({ ...bet, hasCashedOut: false, cashoutMult: 0 })));
        setGameState('waiting');
      }, 4000);
      return () => clearTimeout(timer);
    }

    return () => clearInterval(interval);
  }, [gameState, crashAt]);

  const handlePlaceBet = useCallback((amount) => {
    if (gameState !== 'waiting' && gameState !== 'running') return;
    if (isBetPlaced) return;
    if (amount <= 0) return;

    setIsBetPlaced(true);
    setShowBetSuccess(true);
    setTimeout(() => setShowBetSuccess(false), 2000);
    addBet({ type: 'aviator-preview', amount, target: 'crash', source: 'frontend-preview' });
  }, [gameState, isBetPlaced, addBet]);

  const handleCashout = useCallback(() => {
    if (gameState === 'running' && isBetPlaced && !hasCashedOut) {
      setHasCashedOut(true);
      setAllBets(prev => [{
        id: 'me',
        user: 'You',
        amount: betAmount,
        hasCashedOut: true,
        cashoutMult: multiplier
      }, ...prev]);
    }
  }, [gameState, isBetPlaced, hasCashedOut, betAmount, multiplier]);

  return (
    <GameLayout title="AVIATOR" isWide={true} hideBetPanel={true} hideHeader={true}>
      <div className="flex flex-col h-full bg-black w-full overflow-hidden">
        {/* Custom Aviator Header - Fixed top */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#1c1c1e] border-b border-white/5 shrink-0 z-30">
          <div className="flex items-center gap-4">
            <span className="text-red-600 font-black text-2xl italic tracking-tighter uppercase">Aviator</span>
            <button className="flex items-center gap-1.5 bg-[#f4b400] text-black px-4 py-1.5 rounded-full text-[10px] font-black uppercase shadow-lg hover:scale-105 transition-all">
              <HelpCircle size={14} className="border-2 border-black rounded-full p-0.5" />
              How to play?
            </button>
            <div className="hidden sm:flex items-center rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-sky-200">
              Frontend Preview
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-green-500 font-black text-base tabular-nums">{balance.toFixed(2)}</span>
              <span className="text-gray-500 text-[10px] font-bold uppercase">INR</span>
            </div>
            <button className="text-gray-400 hover:text-white transition-colors">
              <Menu size={24} />
            </button>
          </div>
        </div>

        {/* Main Content Area - Responsive Flex */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
          {/* Sidebar - All Bets (hidden on mobile, scrollable on desktop) */}
          <div className="hidden lg:flex lg:w-[450px] xl:w-[500px] shrink-0 h-full overflow-hidden border-r border-white/5">
            <AviatorSidebar allBets={allBets} />
          </div>

          {/* Game Center Area - Responsive width */}
          <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto custom-scrollbar bg-[#000000]">
            {/* Multiplier History Strip */}
            <AviatorHistory history={history} />

            {/* Graph / Main Area - Expands to fill space */}
            <div className="flex-1 relative aspect-video lg:aspect-auto min-h-[300px] md:min-h-[400px] bg-[#000000] overflow-hidden">
              <AviatorGraph multiplier={multiplier} gameState={gameState} />
            </div>

            {/* Betting Controls - Two columns on large, stacked on mobile if needed */}
            <div className="w-full shrink-0 p-2 bg-[#0a0a0a] border-t border-white/5">
              <AviatorControls 
                betAmount={betAmount}
                setBetAmount={setBetAmount}
                onPlaceBet={handlePlaceBet}
                onCashout={handleCashout}
                gameState={gameState}
                isBetPlaced={isBetPlaced}
                hasCashedOut={hasCashedOut}
                multiplier={multiplier}
              />
            </div>

            {/* Mobile Sidebar - Show below game on mobile */}
            <div className="lg:hidden w-full min-h-[400px] bg-[#0a0a0a] border-t border-white/5">
              <AviatorSidebar allBets={allBets} />
            </div>
          </div>
        </div>
      </div>

      {/* Overlays */}
      <AnimatePresence>
        {showBetSuccess && (
          <Motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
          >
            <div className="bg-[#28a745] px-10 py-5 rounded-2xl shadow-[0_0_50px_rgba(40,167,69,0.5)] font-black text-white uppercase tracking-widest border border-green-400">
              Bet Placed Successfully
            </div>
          </Motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {hasCashedOut && (
          <Motion.div
            initial={{ scale: 0.5, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: -20 }}
            className="fixed inset-0 pointer-events-none flex items-center justify-center z-[70]"
          >
            <div className="bg-[#28a745] px-10 py-5 rounded-2xl shadow-[0_0_50px_rgba(40,167,69,0.5)] border-2 border-green-400 text-center backdrop-blur-sm bg-opacity-90">
              <div className="text-white text-xs font-black uppercase tracking-widest mb-1">You cashed out at</div>
              <div className="text-4xl font-black text-white italic tracking-tighter mb-1">
                {multiplier.toFixed(2)}x
              </div>
              <div className="text-white font-black text-2xl drop-shadow-md">
                {formatINR(betAmount * multiplier)}
              </div>
            </div>
          </Motion.div>
        )}
      </AnimatePresence>
    </GameLayout>
  );
};

export default Aviator;
