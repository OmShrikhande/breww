import React, { useState, useEffect, useRef } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, History, Sparkles } from 'lucide-react';

import GameLayout from '../GameLayout';
import RoundStatusBar from '../../components/games/RoundStatusBar';
import { useGameRound } from '../../hooks/useGameRound';
import { useRoundBetting } from '../../hooks/useRoundBetting';
import { useAudio } from '../../context/AudioContext';
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

function generateRoundCards(roundId, winner = 'andar') {
  const seed = (Number(roundId) || 1234) % 1000;
  const jokerRank = CARD_RANKS[(seed + 3) % CARD_RANKS.length];
  const jokerSuit = CARD_SUITS[(seed + 1) % CARD_SUITS.length];
  
  const andarCards = [];
  const baharCards = [];
  
  const poolRanks = CARD_RANKS.filter((r) => r !== jokerRank);
  const steps = 3 + ((seed * 7) % 3);

  for (let i = 0; i < steps; i++) {
    const r1 = poolRanks[(seed + i * 3) % poolRanks.length];
    const s1 = CARD_SUITS[(seed + i * 2) % CARD_SUITS.length];
    andarCards.push({ rank: r1, suit: s1, isMatch: false });

    const r2 = poolRanks[(seed + i * 5 + 1) % poolRanks.length];
    const s2 = CARD_SUITS[(seed + i * 4 + 2) % CARD_SUITS.length];
    baharCards.push({ rank: r2, suit: s2, isMatch: false });
  }

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
  const { timerLeft, bettingOpen, result, declaredRoundId, history, roundId, refresh } = useGameRound(GAME_ID);
  const { placeBet, betError, betSuccess, placing } = useRoundBetting(GAME_ID);
  const { playChip, playCard, playWin, playLose, playTick } = useAudio();

  const [selectedBet, setSelectedBet] = useState(null);
  const [lastPlacedBet, setLastPlacedBet] = useState(null);
  const [displayResult, setDisplayResult] = useState(null);
  const [isDealing, setIsDealing] = useState(false);
  const [simCards, setSimCards] = useState(() => generateRoundCards(roundId, 'andar'));
  const lastHandledKeyRef = useRef(null);

  useEffect(() => {
    if (!result) return;
    const declarationKey = `${declaredRoundId || 'curr'}-${result}`;
    if (lastHandledKeyRef.current === declarationKey) return;
    lastHandledKeyRef.current = declarationKey;

    setIsDealing(true);
    playCard();
    
    const outcome = String(result).toLowerCase().includes('bahar') ? 'bahar' : 'andar';
    const cards = generateRoundCards(declaredRoundId || roundId, outcome);
    setSimCards(cards);

    setTimeout(() => {
      setDisplayResult(outcome);
      setIsDealing(false);
      if (lastPlacedBet?.type === outcome) {
        playWin();
      } else if (lastPlacedBet) {
        playLose();
      }
      refresh();
      setTimeout(() => setDisplayResult(null), 6000);
    }, 1600);
  }, [result, declaredRoundId, roundId, refresh, playCard, playWin, playLose, lastPlacedBet]);

  const handleBetClick = async (amount) => {
    if (!selectedBet) return;
    playChip();
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
      <div className="flex flex-col gap-2 h-full justify-between select-none">
        <RoundStatusBar roundId={roundId} timerLeft={timerLeft} bettingOpen={bettingOpen} accent={ACCENT} />

        {/* Card Stage Arena (Compact responsive height) */}
        <div className="game-glass rounded-2xl p-3 border border-white/10 relative flex-1 min-h-[190px] sm:min-h-[220px] flex flex-col items-center justify-between overflow-hidden shadow-2xl bg-[#0d1424]/90">
          <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-transparent to-black/40 pointer-events-none" />

          {/* Center Joker Target Card */}
          <div className="relative z-10 flex flex-col items-center">
            <span className="text-[9px] font-black uppercase tracking-widest text-casino-gold mb-1 flex items-center gap-1">
              <Sparkles size={11} /> Joker Card
            </span>

            <Motion.div
              animate={isDealing ? { scale: [1, 1.08, 1], rotateY: [0, 180, 360] } : {}}
              transition={{ duration: 0.8 }}
              className={`w-12 h-16 sm:w-14 sm:h-20 rounded-xl border-2 border-casino-gold bg-white shadow-[0_0_20px_rgba(245,197,66,0.35)] flex flex-col items-center justify-between p-1.5 font-black ${
                isRedSuit(simCards.joker.suit) ? 'text-red-600' : 'text-slate-900'
              }`}
            >
              <span className="text-xs sm:text-sm leading-none self-start">{simCards.joker.rank}</span>
              <span className="text-base sm:text-xl leading-none">{simCards.joker.suit}</span>
              <span className="text-xs sm:text-sm leading-none self-end rotate-180">{simCards.joker.rank}</span>
            </Motion.div>
          </div>

          {/* Dealt Cards Lanes (Andar vs Bahar) */}
          <div className="relative z-10 flex w-full justify-between gap-2 px-1 my-auto">
            {/* Andar Side */}
            <div className="flex-1 flex flex-col items-center p-2 rounded-xl bg-black/40 border border-amber-500/30">
              <span className="text-[10px] font-black uppercase text-amber-400 mb-1">🅰️ Andar</span>
              <div className="flex gap-1 overflow-x-auto custom-scrollbar max-w-full py-0.5">
                {simCards.andarCards.slice(0, 5).map((c, i) => (
                  <div
                    key={i}
                    className={`w-7 h-10 sm:w-8 sm:h-12 rounded-lg flex flex-col items-center justify-center p-0.5 font-black text-[10px] shadow-sm border ${
                      c.isMatch
                        ? 'bg-amber-400 text-slate-950 border-amber-300 ring-2 ring-amber-300 animate-pulse'
                        : `bg-white ${isRedSuit(c.suit) ? 'text-red-600' : 'text-slate-900'} border-white/20`
                    }`}
                  >
                    <span>{c.rank}</span>
                    <span className="text-[11px] leading-none">{c.suit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bahar Side */}
            <div className="flex-1 flex flex-col items-center p-2 rounded-xl bg-black/40 border border-blue-500/30">
              <span className="text-[10px] font-black uppercase text-sky-400 mb-1">🅱️ Bahar</span>
              <div className="flex gap-1 overflow-x-auto custom-scrollbar max-w-full py-0.5">
                {simCards.baharCards.slice(0, 5).map((c, i) => (
                  <div
                    key={i}
                    className={`w-7 h-10 sm:w-8 sm:h-12 rounded-lg flex flex-col items-center justify-center p-0.5 font-black text-[10px] shadow-sm border ${
                      c.isMatch
                        ? 'bg-sky-400 text-slate-950 border-sky-300 ring-2 ring-sky-300 animate-pulse'
                        : `bg-white ${isRedSuit(c.suit) ? 'text-red-600' : 'text-slate-900'} border-white/20`
                    }`}
                  >
                    <span>{c.rank}</span>
                    <span className="text-[11px] leading-none">{c.suit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Winner Outcome Overlay */}
          <AnimatePresence>
            {displayResult && (
              <Motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center z-30 pointer-events-none"
              >
                <div
                  className={`px-6 py-3 rounded-2xl font-black text-xl uppercase tracking-wider shadow-2xl text-white border-2 ${
                    displayResult === 'andar'
                      ? 'bg-gradient-to-r from-amber-600 to-orange-700 border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.6)]'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-700 border-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.6)]'
                  }`}
                >
                  🎉 {displayResult.toUpperCase()} WINS!
                </div>
              </Motion.div>
            )}
          </AnimatePresence>
        </div>

        {betError && (
          <p className="text-center text-xs text-red-400 bg-red-500/15 border border-red-500/30 rounded-xl py-1.5 px-3 font-bold">
            {betError}
          </p>
        )}

        {/* 2 Main Bet Buttons (Andar vs Bahar) */}
        <div className={`grid grid-cols-2 gap-2 ${!bettingOpen ? 'opacity-50 pointer-events-none' : ''}`}>
          {BETS.map((b) => {
            const isSelected = selectedBet?.type === b.type;
            return (
              <button
                key={b.type}
                type="button"
                onClick={() => {
                  playChip();
                  setSelectedBet(isSelected ? null : b);
                }}
                className={`group relative overflow-hidden rounded-xl py-2.5 px-2 border transition-all duration-150 active:scale-95 cursor-pointer text-center bg-gradient-to-br ${b.gradient} ${
                  isSelected
                    ? 'ring-2 ring-casino-gold border-casino-gold shadow-glow-gold scale-[1.02]'
                    : 'border-white/10 hover:border-white/30'
                }`}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span className="text-lg">{b.emoji}</span>
                  <span className="text-xs sm:text-sm font-black uppercase text-white tracking-wide">{b.label}</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-white/80 block mt-0.5 bg-black/30 px-2 py-0.5 rounded-full mx-auto w-max">
                  {b.mult}
                </span>
              </button>
            );
          })}
        </div>

        {/* Recent Outcomes History (Compact single-line ribbon) */}
        {history.length > 0 && (
          <div className="glass-panel rounded-xl p-2 border border-white/10 flex items-center justify-between gap-2 overflow-hidden shrink-0">
            <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-white/40 shrink-0">
              <History size={12} />
              <span>History</span>
            </div>
            <div className="flex gap-1.5 overflow-x-auto custom-scrollbar py-0.5">
              {history.slice(0, 10).map((h, i) => {
                const isAndar = String(h.result).toLowerCase().includes('andar');
                return (
                  <span
                    key={i}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase shrink-0 border ${
                      isAndar
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                    }`}
                  >
                    {isAndar ? '🅰️ A' : '🅱️ B'}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Bet Confirmation Toast */}
        <AnimatePresence>
          {betSuccess && (
            <Motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-xs font-black text-white shadow-2xl"
            >
              <CheckCircle2 size={16} /> Bet Placed on {lastPlacedBet?.label || 'Andar'} · {formatINR(lastPlacedBet?.amount || 50)}!
            </Motion.div>
          )}
        </AnimatePresence>
      </div>
    </GameLayout>
  );
};

export default AndarBahar;
