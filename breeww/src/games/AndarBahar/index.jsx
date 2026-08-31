import React, { useState, useEffect, useRef } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, History, Sparkles, ShieldCheck } from 'lucide-react';

import GameLayout from '../GameLayout';
import RoundStatusBar from '../../components/games/RoundStatusBar';
import { useGameRound } from '../../hooks/useGameRound';
import { useRoundBetting } from '../../hooks/useRoundBetting';
import { formatBetLabel } from '../../utils/gameHelpers';
import { formatINR } from '../../utils/formatCurrency';

const GAME_ID = 'andar-bahar';
const ACCENT = '#F59E0B';

const BETS = [
  { type: 'andar', label: 'Andar (Inside)', mult: '1.95×', gradient: 'from-amber-600 to-orange-900', emoji: '🅰️' },
  { type: 'bahar', label: 'Bahar (Outside)', mult: '1.95×', gradient: 'from-blue-600 to-indigo-900', emoji: '🅱️' },
];

const CARD_SUITS = ['♠', '♥', '♦', '♣'];
const CARD_RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

// Generate deterministic or randomized card deal based on roundId and winner
function generateRoundCards(roundId, winner = 'andar') {
  const seed = (Number(roundId) || 1234) % 1000;
  const jokerRank = CARD_RANKS[(seed + 3) % CARD_RANKS.length];
  const jokerSuit = CARD_SUITS[(seed + 1) % CARD_SUITS.length];
  
  const andarCards = [];
  const baharCards = [];
  
  const poolRanks = CARD_RANKS.filter((r) => r !== jokerRank);
  const steps = 3 + ((seed * 7) % 3); // 3 to 5 cards per side

  for (let i = 0; i < steps; i++) {
    const r1 = poolRanks[(seed + i * 3) % poolRanks.length];
    const s1 = CARD_SUITS[(seed + i * 2) % CARD_SUITS.length];
    andarCards.push({ rank: r1, suit: s1, isMatch: false });

    const r2 = poolRanks[(seed + i * 5 + 1) % poolRanks.length];
    const s2 = CARD_SUITS[(seed + i * 4 + 2) % CARD_SUITS.length];
    baharCards.push({ rank: r2, suit: s2, isMatch: false });
  }

  // Final match card lands on the winning side
  if (winner === 'andar') {
    andarCards.push({ rank: jokerRank, suit: CARD_SUITS[(seed + 2) % 4], isMatch: true });
  } else {
    baharCards.push({ rank: jokerRank, suit: CARD_SUITS[(seed + 3) % 4], isMatch: true });
  }

  return {
    joker: { rank: jokerRank, suit: jokerSuit },
    andarCards,
    baharCards,
    winner,
  };
}

const AndarBahar = () => {
  const { timerLeft, bettingOpen, result, history, roundId, refresh } = useGameRound(GAME_ID);
  const { placeBet, betError, betSuccess, placing } = useRoundBetting(GAME_ID);

  const [selectedBet, setSelectedBet] = useState(null);
  const [lastPlacedBet, setLastPlacedBet] = useState(null);
  const [displayResult, setDisplayResult] = useState(null);
  const [isDealing, setIsDealing] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [simCards, setSimCards] = useState(() => generateRoundCards(roundId, 'andar'));
  
  const activeRoundRef = useRef(roundId);

  // When round changes, generate fresh Joker card and reset deal
  useEffect(() => {
    if (roundId && roundId !== activeRoundRef.current) {
      activeRoundRef.current = roundId;
      setSimCards(generateRoundCards(roundId, 'andar'));
      setDisplayResult(null);
      setIsDealing(false);
    }
  }, [roundId]);

  // When result arrives from round declaration
  useEffect(() => {
    if (!result || result === lastResult) return;
    setLastResult(result);
    setIsDealing(true);
    
    const outcome = String(result).toLowerCase().includes('bahar') ? 'bahar' : 'andar';
    const cards = generateRoundCards(roundId, outcome);
    setSimCards(cards);

    setTimeout(() => {
      setDisplayResult(outcome);
      setIsDealing(false);
      refresh();
      setTimeout(() => setDisplayResult(null), 5000);
    }, 1600);
  }, [result, lastResult, roundId, refresh]);

  const handleBetClick = async (amount) => {
    if (!selectedBet) return;
    const bet = { type: 'side', value: selectedBet.type };
    setLastPlacedBet({ ...selectedBet, amount });
    const ok = await placeBet(bet, amount, { bettingOpen });
    if (ok) {
      setSelectedBet(null);
    }
  };

  const isRedSuit = (suit) => suit === '♥' || suit === '♦';

  return (
    <GameLayout
      title="Andar Bahar"
      subtitle="Match the Joker · 30s live rounds"
      accent={ACCENT}
      onPlaceBet={handleBetClick}
      betDisabled={!bettingOpen || !selectedBet || placing || isDealing}
      selectedLabel={selectedBet ? formatBetLabel({ type: 'side', value: selectedBet.type }) : ''}
    >
      <div className="flex flex-col gap-4 pb-4">
        <RoundStatusBar roundId={roundId} timerLeft={timerLeft} bettingOpen={bettingOpen} accent={ACCENT} />

        {/* Card Stage Arena */}
        <div className="game-glass rounded-3xl p-6 border border-white/10 relative min-h-[360px] flex flex-col items-center justify-between overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-transparent to-black/40 pointer-events-none" />

          {/* Center Joker Card Header */}
          <div className="relative z-10 flex flex-col items-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-casino-gold mb-1.5 flex items-center gap-1">
              <Sparkles size={12} /> Joker Target Card
            </span>

            <Motion.div
              animate={isDealing ? { scale: [1, 1.08, 1], rotateY: [0, 180, 360] } : {}}
              transition={{ duration: 0.8 }}
              className={`w-16 h-24 sm:w-20 sm:h-28 rounded-2xl border-2 border-casino-gold bg-white shadow-[0_0_25px_rgba(245,197,66,0.4)] flex flex-col items-center justify-between p-2 font-black ${
                isRedSuit(simCards.joker.suit) ? 'text-red-600' : 'text-slate-900'
              }`}
            >
              <span className="text-sm sm:text-base self-start leading-none">{simCards.joker.rank}</span>
              <span className="text-2xl sm:text-3xl leading-none">{simCards.joker.suit}</span>
              <span className="text-sm sm:text-base self-end leading-none">{simCards.joker.rank}</span>
            </Motion.div>
          </div>

          {/* Andar vs Bahar Dealt Rows */}
          <div className="relative z-10 w-full grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
            {/* Andar Side */}
            <div className={`p-4 rounded-2xl border transition-all ${
              displayResult === 'andar' ? 'bg-amber-500/25 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.5)] ring-2 ring-amber-400' : 'bg-black/30 border-white/10'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-black text-sm text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span>🅰️</span> Andar (Inside)
                </span>
                <span className="text-xs font-bold text-white/60 font-mono bg-amber-500/10 px-2 py-0.5 rounded-md">1.95×</span>
              </div>
              <div className="flex gap-1.5 overflow-x-auto custom-scrollbar min-h-[64px] items-center p-1">
                {simCards.andarCards.map((c, i) => (
                  <Motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.5, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`w-10 h-14 rounded-lg flex flex-col items-center justify-center font-bold text-xs shrink-0 shadow-md ${
                      c.isMatch && displayResult === 'andar'
                        ? 'bg-amber-400 text-black font-black ring-4 ring-white scale-110 shadow-glow-gold animate-pulse'
                        : 'bg-white/95 text-slate-900'
                    } ${isRedSuit(c.suit) && !(c.isMatch && displayResult === 'andar') ? 'text-red-600' : ''}`}
                  >
                    <span>{c.rank}</span>
                    <span className="text-sm leading-none">{c.suit}</span>
                  </Motion.div>
                ))}
              </div>
            </div>

            {/* Bahar Side */}
            <div className={`p-4 rounded-2xl border transition-all ${
              displayResult === 'bahar' ? 'bg-blue-500/25 border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.5)] ring-2 ring-blue-400' : 'bg-black/30 border-white/10'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-black text-sm text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span>🅱️</span> Bahar (Outside)
                </span>
                <span className="text-xs font-bold text-white/60 font-mono bg-blue-500/10 px-2 py-0.5 rounded-md">1.95×</span>
              </div>
              <div className="flex gap-1.5 overflow-x-auto custom-scrollbar min-h-[64px] items-center p-1">
                {simCards.baharCards.map((c, i) => (
                  <Motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.5, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`w-10 h-14 rounded-lg flex flex-col items-center justify-center font-bold text-xs shrink-0 shadow-md ${
                      c.isMatch && displayResult === 'bahar'
                        ? 'bg-blue-400 text-black font-black ring-4 ring-white scale-110 shadow-glow animate-pulse'
                        : 'bg-white/95 text-slate-900'
                    } ${isRedSuit(c.suit) && !(c.isMatch && displayResult === 'bahar') ? 'text-red-600' : ''}`}
                  >
                    <span>{c.rank}</span>
                    <span className="text-sm leading-none">{c.suit}</span>
                  </Motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Outcome Winner Banner */}
          <AnimatePresence>
            {displayResult && (
              <Motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center z-30 pointer-events-none"
              >
                <div className={`px-8 py-4 rounded-3xl font-black text-2xl uppercase tracking-wider shadow-2xl text-black ${
                  displayResult === 'andar' ? 'bg-gradient-to-r from-amber-400 to-amber-500' : 'bg-gradient-to-r from-blue-400 to-blue-500'
                }`}>
                  🎉 {displayResult.toUpperCase()} WINS!
                </div>
              </Motion.div>
            )}
          </AnimatePresence>
        </div>

        {betError && (
          <p className="text-center text-sm text-red-400 bg-red-500/15 border border-red-500/30 rounded-2xl py-2.5 px-4 font-bold animate-fadeIn">
            {betError}
          </p>
        )}

        {/* Betting Selection Cards */}
        <div className={`grid grid-cols-2 gap-4 ${!bettingOpen ? 'opacity-60 pointer-events-none' : ''}`}>
          {BETS.map((b) => {
            const isSelected = selectedBet?.type === b.type;
            return (
              <button
                key={b.type}
                type="button"
                onClick={() => setSelectedBet(isSelected ? null : b)}
                className={`group relative overflow-hidden rounded-3xl p-5 sm:p-6 transition-all duration-300 border text-left active:scale-[0.98] cursor-pointer ${
                  isSelected
                    ? 'border-casino-gold bg-casino-gold/20 shadow-glow-gold scale-[1.02] ring-2 ring-casino-gold'
                    : 'border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl">{b.emoji}</span>
                  <span className="px-2.5 py-1 rounded-full bg-white/10 font-mono text-xs font-black text-white/80">
                    {b.mult}
                  </span>
                </div>
                <div className="text-base sm:text-lg font-black uppercase text-white tracking-wide">{b.label}</div>
                <p className="text-[11px] text-white/50 mt-0.5">Matching card lands on {b.type}</p>
              </button>
            );
          })}
        </div>

        {/* History Table */}
        <div className="glass-panel rounded-3xl p-4 sm:p-6 border border-white/10 shadow-xl">
          <div className="flex items-center gap-2 font-black text-sm text-white/60 mb-3">
            <History size={16} />
            <span>Recent Outcomes</span>
          </div>
          <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1">
            {history.slice(0, 14).map((h, i) => {
              const res = String(h.result || '').toLowerCase();
              const isAndar = res.includes('andar');
              return (
                <div
                  key={i}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider shrink-0 border ${
                    isAndar
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                  }`}
                >
                  {isAndar ? '🅰️ Andar' : '🅱️ Bahar'}
                </div>
              );
            })}
          </div>
        </div>

        {/* Success Confirmation Toast */}
        <AnimatePresence>
          {betSuccess && (
            <Motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-sm font-black text-white shadow-2xl"
            >
              <CheckCircle2 size={18} /> Bet Placed on {lastPlacedBet?.label || 'Andar'} · {formatINR(lastPlacedBet?.amount || 50)}!
            </Motion.div>
          )}
        </AnimatePresence>
      </div>
    </GameLayout>
  );
};

export default AndarBahar;
