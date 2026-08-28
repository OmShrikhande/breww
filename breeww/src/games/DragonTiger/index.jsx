import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { Wallet, Info, History, CheckCircle2, Timer } from 'lucide-react';
import GameLayout from '../GameLayout';
import { useWallet } from '../../hooks/useWallet';
import { useBets } from '../../hooks/useBets';
import { formatINR } from '../../utils/formatCurrency';

const DragonTiger = () => {
  const { balance } = useWallet();
  const { bets, addBet, clearBets } = useBets();

  // Local state
  const [timeLeft, setTimeLeft] = useState(30);
  const [isDealing, setIsDealing] = useState(false);
  const [result, setResult] = useState(null); // { dragon: { value, suit }, tiger: { value, suit }, winner }
  const [gameHistory, setGameHistory] = useState([]);
  const [selectedBet, setSelectedBet] = useState(null); // { type, value, multiplier }
  const [showBetSuccess, setShowBetSuccess] = useState(false);

  const betsRef = useRef([]);
  useEffect(() => {
    betsRef.current = bets;
  }, [bets]);

  const getCardDisplay = (val) => {
    if (val === 1) return 'A';
    if (val === 11) return 'J';
    if (val === 12) return 'Q';
    if (val === 13) return 'K';
    return val;
  };

  const handleReveal = useCallback(() => {
    setIsDealing(true);
    
    // 1. Generate Result
    const suits = ['♠', '♣', '♥', '♦'];
    const dragonVal = Math.floor(Math.random() * 13) + 1;
    const tigerVal = Math.floor(Math.random() * 13) + 1;
    const dragonSuit = suits[Math.floor(Math.random() * 4)];
    const tigerSuit = suits[Math.floor(Math.random() * 4)];

    let winner = 'tie';
    if (dragonVal > tigerVal) winner = 'dragon';
    else if (tigerVal > dragonVal) winner = 'tiger';

    const currentResult = {
      dragon: { value: dragonVal, suit: dragonSuit },
      tiger: { value: tigerVal, suit: tigerSuit },
      winner
    };

    // 2. Wait for animation
    setTimeout(() => {
      setResult(currentResult);
      setGameHistory(prev => [currentResult, ...prev].slice(0, 10));

      // 3. Evaluate Bets
      // 4. Reset for next round
      setTimeout(() => {
        setIsDealing(false);
        setResult(null);
        clearBets();
        setSelectedBet(null);
        setTimeLeft(30);
      }, 4000);
    }, 2000);
  }, [clearBets]);

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
    if (timeLeft <= 3) return;

    addBet({ ...selectedBet, amount, source: 'frontend-preview' });
    setShowBetSuccess(true);
    setTimeout(() => setShowBetSuccess(false), 2000);
  };

  const isBettingDisabled = timeLeft <= 3 || isDealing;

  return (
    <GameLayout title="Dragon Tiger 30s" onPlaceBet={handleBetClick} betDisabled={isBettingDisabled}>
      <div className="flex flex-col gap-4 max-w-2xl mx-auto pb-10">
        
        {/* Header Section */}
        <div className="bg-[#141A3C] rounded-2xl p-5 border border-white/5 shadow-2xl relative overflow-hidden flex justify-between items-center">
          <div className="flex flex-col gap-1 relative z-10">
            <h1 className="text-sm font-black text-gray-400 uppercase tracking-widest">Dragon Tiger</h1>
            <div className="flex gap-1.5">
              {gameHistory.slice(0, 5).map((h, i) => (
                <div key={i} className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-lg ${
                  h.winner === 'dragon' ? 'bg-red-600' : h.winner === 'tiger' ? 'bg-yellow-600' : 'bg-green-600'
                }`}>
                  {h.winner[0].toUpperCase()}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-sky-200">
            Preview
          </div>
          
          <div className="flex flex-col items-end relative z-10">
            <div className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-1">
              <Timer size={12} />
              Time Left
            </div>
            <div className="flex items-center gap-1">
              {[Math.floor(timeLeft / 10), timeLeft % 10].map((n, i) => (
                <div key={i} className={`w-8 h-12 flex items-center justify-center rounded-lg font-black text-2xl shadow-inner border border-white/5 ${
                  timeLeft <= 3 ? 'bg-red-500 text-white' : 'bg-white text-[#141A3C]'
                }`}>
                  {n}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Balance Section */}
        <div className="bg-[#141A3C] rounded-2xl p-4 border border-white/5 shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500/10 rounded-2xl text-green-400 border border-green-500/20">
              <Wallet size={24} />
            </div>
            <div>
              <div className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Your Balance</div>
              <div className="text-xl font-black text-white">{formatINR(balance)}</div>
            </div>
          </div>
          <button className="bg-casino-accent px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg active:scale-95">
            Deposit
          </button>
        </div>

        {/* Game Board */}
        <div className="bg-[#141A3C] rounded-[2.5rem] p-8 border border-white/5 shadow-2xl relative overflow-hidden flex flex-col items-center min-h-[400px]">
          
          {/* Decorative Background Elements */}
          <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
             <div className="absolute top-10 left-10 text-9xl">🐉</div>
             <div className="absolute bottom-10 right-10 text-9xl">🐅</div>
          </div>

          <div className="absolute top-6 left-6 flex items-center gap-2">
            <div className="bg-orange-500/10 text-orange-500 px-3 py-1 rounded-full text-[10px] font-black border border-orange-500/20 flex items-center gap-1.5 uppercase tracking-widest">
              <Info size={12} />
              How to play
            </div>
          </div>

          <div className="flex justify-between items-center w-full gap-4 mt-8 relative z-10">
            {/* Dragon Side */}
            <div className="flex-1 flex flex-col items-center gap-6">
              <Motion.div 
                animate={result?.winner === 'dragon' ? { scale: [1, 1.1, 1] } : {}}
                className={`text-4xl font-black italic tracking-tighter uppercase transition-colors ${
                  result?.winner === 'dragon' ? 'text-red-400' : 'text-red-600'
                }`}
              >
                DRAGON
              </Motion.div>
              <Card 
                card={result?.dragon} 
                isDealing={isDealing && !result} 
                isWinner={result?.winner === 'dragon'}
                side="dragon"
              />
            </div>

            {/* VS Middle */}
            <div className="relative flex items-center justify-center">
               <Motion.div
                 animate={isDealing ? { rotate: 360 } : {}}
                 transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                 className="text-4xl font-black text-gray-700 italic z-10"
               >
                 VS
               </Motion.div>
               <div className="absolute w-20 h-20 bg-white/5 rounded-full blur-xl"></div>
            </div>

            {/* Tiger Side */}
            <div className="flex-1 flex flex-col items-center gap-6">
              <Motion.div 
                animate={result?.winner === 'tiger' ? { scale: [1, 1.1, 1] } : {}}
                className={`text-4xl font-black italic tracking-tighter uppercase transition-colors ${
                  result?.winner === 'tiger' ? 'text-yellow-400' : 'text-yellow-500'
                }`}
              >
                TIGER
              </Motion.div>
              <Card 
                card={result?.tiger} 
                isDealing={isDealing && !result} 
                isWinner={result?.winner === 'tiger'}
                side="tiger"
              />
            </div>
          </div>

          {/* Result Overlay */}
          <AnimatePresence>
            {result && (
              <Motion.div 
                initial={{ y: 50, opacity: 0, scale: 0.5 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 50, opacity: 0, scale: 0.5 }}
                className={`mt-12 px-10 py-3 rounded-2xl text-2xl font-black uppercase tracking-[0.2em] shadow-2xl border-2 z-20 ${
                  result.winner === 'dragon' ? 'bg-red-600 border-red-400 text-white shadow-red-600/50' : 
                  result.winner === 'tiger' ? 'bg-yellow-600 border-yellow-400 text-white shadow-yellow-600/50' : 
                  'bg-green-600 border-green-400 text-white shadow-green-600/50'
                }`}
              >
                {result.winner === 'tie' ? 'Tie!' : `${result.winner} Wins!`}
              </Motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bet Panel */}
        <div className={`space-y-4 transition-opacity ${isBettingDisabled ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="grid grid-cols-3 gap-3">
            {[
              { type: 'dragon', label: 'Dragon', mult: 2, color: 'bg-red-600', hover: 'hover:bg-red-500', shadow: 'shadow-red-900/40' },
              { type: 'tie', label: 'Tie', mult: 8, color: 'bg-green-600', hover: 'hover:bg-green-500', shadow: 'shadow-green-900/40' },
              { type: 'tiger', label: 'Tiger', mult: 2, color: 'bg-yellow-600', hover: 'hover:bg-yellow-500', shadow: 'shadow-yellow-900/40' }
            ].map((b) => (
              <button
                key={b.type}
                onClick={() => setSelectedBet({ type: 'side', value: b.type, multiplier: b.mult })}
                className={`py-4 rounded-2xl flex flex-col items-center gap-1 transition-all shadow-xl active:scale-95 ${
                  selectedBet?.value === b.type 
                    ? `${b.color} text-white ring-4 ring-white/20 scale-105 ${b.shadow}` 
                    : `bg-[#141A3C] text-gray-400 border border-white/5 ${b.hover} hover:text-white`
                }`}
              >
                <span className="text-sm font-black uppercase tracking-widest">{b.label}</span>
                <span className={`text-[10px] font-bold ${selectedBet?.value === b.type ? 'text-white/80' : 'text-gray-500'}`}>
                  Payout {b.mult}x
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Game History */}
        <div className="bg-[#141A3C] rounded-2xl border border-white/5 shadow-xl overflow-hidden mb-10">
          <div className="p-4 border-b border-white/5 flex items-center gap-2 bg-white/5">
            <History size={16} className="text-casino-accent" />
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-300">Game History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-[10px] font-black text-gray-500 uppercase tracking-widest bg-black/20">
                  <th className="px-5 py-3">Dragon</th>
                  <th className="px-5 py-3">Tiger</th>
                  <th className="px-5 py-3">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {gameHistory.map((h, i) => (
                  <tr key={i} className="text-xs font-black text-gray-300 hover:bg-white/5 transition-colors">
                    <td className="px-5 py-4">
                      {getCardDisplay(h.dragon.value)} {h.dragon.suit}
                    </td>
                    <td className="px-5 py-4">
                      {getCardDisplay(h.tiger.value)} {h.tiger.suit}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-3 py-1 rounded-full text-[9px] uppercase tracking-widest border ${
                        h.winner === 'dragon' ? 'bg-red-600/10 border-red-500/30 text-red-500' : 
                        h.winner === 'tiger' ? 'bg-yellow-600/10 border-yellow-500/30 text-yellow-500' : 
                        'bg-green-600/10 border-green-500/30 text-green-500'
                      }`}>
                        {h.winner}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Success Toast */}
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

const Card = ({ card, isDealing, isWinner, side }) => {
  const getCardDisplay = (val) => {
    if (val === 1) return 'A';
    if (val === 11) return 'J';
    if (val === 12) return 'Q';
    if (val === 13) return 'K';
    return val;
  };

  const isRed = card?.suit === '♥' || card?.suit === '♦';

  return (
    <div className="relative w-32 h-48">
      <Motion.div
        animate={{ 
          rotateY: card ? 180 : 0,
          scale: isWinner ? 1.1 : 1,
          rotateZ: isWinner ? (side === 'dragon' ? -2 : 2) : 0
        }}
        transition={{ duration: 0.8, type: 'spring', damping: 12 }}
        style={{ transformStyle: 'preserve-3d' }}
        className="w-full h-full relative"
      >
        {/* Card Back */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1e254a] to-[#0B0F2A] rounded-2xl border-2 border-casino-accent/40 flex items-center justify-center backface-hidden shadow-2xl overflow-hidden">
          <div className="absolute inset-2 border border-casino-accent/10 rounded-xl"></div>
          <div className="w-full h-full opacity-5 flex flex-wrap gap-1 p-2">
            {[...Array(30)].map((_, i) => (
              <span key={i} className="text-white text-[6px] font-black">BREWW</span>
            ))}
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-16 h-16 rounded-full bg-casino-accent/5 border border-casino-accent/20 flex items-center justify-center backdrop-blur-sm shadow-inner">
                <span className="text-casino-accent font-black text-3xl italic tracking-tighter">B</span>
             </div>
          </div>
        </div>

        {/* Card Front */}
        <div 
          className="absolute inset-0 bg-white rounded-2xl flex flex-col p-3 backface-hidden shadow-2xl rotate-y-180 border border-gray-200"
        >
          {card && (
            <>
              <div className={`text-2xl font-black leading-none ${isRed ? 'text-red-500' : 'text-gray-900'}`}>
                {getCardDisplay(card.value)}
              </div>
              <div className={`text-lg ${isRed ? 'text-red-500' : 'text-gray-900'}`}>{card.suit}</div>
              <div className="flex-1 flex items-center justify-center">
                <div className={`text-6xl ${isRed ? 'text-red-500' : 'text-gray-900'} drop-shadow-sm`}>{card.suit}</div>
              </div>
              <div className="absolute bottom-3 right-3 flex flex-col items-end rotate-180">
                 <div className={`text-2xl font-black leading-none ${isRed ? 'text-red-500' : 'text-gray-900'}`}>
                    {getCardDisplay(card.value)}
                 </div>
                 <div className={`text-lg ${isRed ? 'text-red-500' : 'text-gray-900'}`}>{card.suit}</div>
              </div>
            </>
          )}
        </div>
      </Motion.div>
      
      {/* Dealing Animation Overlay */}
      {isDealing && (
        <Motion.div
          initial={{ y: -400, x: side === 'dragon' ? 100 : -100, opacity: 0, rotate: 45 }}
          animate={{ y: 0, x: 0, opacity: 1, rotate: 0 }}
          transition={{ duration: 0.5, delay: side === 'tiger' ? 0.3 : 0 }}
          className="absolute inset-0 z-10 pointer-events-none rounded-2xl bg-gradient-to-br from-[#1e254a] to-[#0B0F2A] border-2 border-casino-accent/40 flex items-center justify-center"
        >
           <span className="text-casino-accent font-black text-2xl italic">B</span>
        </Motion.div>
      )}
    </div>
  );
};

export default DragonTiger;
