import React, { useState, useEffect, useRef } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, History, Sparkles } from 'lucide-react';

import GameLayout from '../GameLayout';
import RoundStatusBar from '../../components/games/RoundStatusBar';
import { useGameRound, parseDragonTigerResult } from '../../hooks/useGameRound';
import { useRoundBetting } from '../../hooks/useRoundBetting';
import { useAudio } from '../../context/AudioContext';
import { formatBetLabel } from '../../utils/gameHelpers';
import { formatINR } from '../../utils/formatCurrency';

const GAME_ID = 'dragon-tiger';
const ACCENT = '#9B59B6';

const BETS = [
  { type: 'dragon', label: 'Dragon', mult: '1.95×', gradient: 'from-red-600 to-rose-900', emoji: '🐉', color: '#EF4444' },
  { type: 'tie', label: 'Tie', mult: '8×', gradient: 'from-emerald-600 to-green-900', emoji: '⚖️', color: '#10B981' },
  { type: 'tiger', label: 'Tiger', mult: '1.95×', gradient: 'from-amber-500 to-orange-800', emoji: '🐅', color: '#F59E0B' },
];

const CARD_RANKS = { 1: 'A', 11: 'J', 12: 'Q', 13: 'K' };

const DragonTiger = () => {
  const { timerLeft, bettingOpen, result, history, roundId, refresh } = useGameRound(GAME_ID);
  const { placeBet, betError, betSuccess, placing } = useRoundBetting(GAME_ID);
  const { playChip, playCard, playDragon, playTiger, playTie, playWin, playLose, playTick } = useAudio();

  const [selectedBet, setSelectedBet] = useState(null);
  const [lastPlacedBet, setLastPlacedBet] = useState(null);
  const [displayResult, setDisplayResult] = useState(null);
  const [isDealing, setIsDealing] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const activeRoundRef = useRef(roundId);

  useEffect(() => {
    if (roundId && roundId !== activeRoundRef.current) {
      activeRoundRef.current = roundId;
      setDisplayResult(null);
      setIsDealing(false);
    }
  }, [roundId]);

  useEffect(() => {
    if (timerLeft > 0 && timerLeft <= 5) {
      playTick(true);
    }
  }, [timerLeft, playTick]);

  useEffect(() => {
    if (!result || result === lastResult) return;
    setLastResult(result);
    setIsDealing(true);
    playCard();

    const parsed = parseDragonTigerResult(result, roundId);

    setTimeout(() => {
      setDisplayResult(parsed);
      setIsDealing(false);
      
      if (parsed.winner === 'dragon') playDragon();
      else if (parsed.winner === 'tiger') playTiger();
      else if (parsed.winner === 'tie') playTie();

      if (lastPlacedBet?.type === parsed.winner) {
        setTimeout(() => playWin(), 250);
      } else if (lastPlacedBet) {
        setTimeout(() => playLose(), 250);
      }

      refresh();
      setTimeout(() => setDisplayResult(null), 5000);
    }, 1200);
  }, [result, lastResult, roundId, refresh, playCard, playDragon, playTiger, playTie, playWin, playLose, lastPlacedBet]);

  const gameHistory = history.map((h) => parseDragonTigerResult(h.result, h.roundId));

  const handleBetClick = async (amount) => {
    if (!selectedBet) return;
    playChip();
    const bet = { type: 'side', value: selectedBet.type };
    setLastPlacedBet({ ...selectedBet, amount });
    const ok = await placeBet(bet, amount, { bettingOpen });
    if (ok) setSelectedBet(null);
  };

  const cardRank = (val) => CARD_RANKS[val] || val || '?';

  return (
    <GameLayout
      title="Dragon Tiger"
      subtitle="High card wins · 30s live rounds"
      accent={ACCENT}
      onPlaceBet={handleBetClick}
      betDisabled={!bettingOpen || !selectedBet || placing || isDealing}
      selectedLabel={selectedBet ? formatBetLabel({ type: 'side', value: selectedBet.type }) : ''}
    >
      <div className="flex flex-col gap-2 h-full justify-between select-none">
        <RoundStatusBar roundId={roundId} timerLeft={timerLeft} bettingOpen={bettingOpen} accent={ACCENT} />

        {/* Dragon vs Tiger Card Arena (Compact height) */}
        <div className="game-glass rounded-2xl p-3 border border-white/10 relative flex-1 min-h-[190px] sm:min-h-[220px] flex flex-col items-center justify-between overflow-hidden shadow-2xl bg-[#0d1424]/90 backdrop-blur-md">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-transparent to-black/40 pointer-events-none" />

          {/* Top Status */}
          <div className="relative z-10 flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-casino-gold mb-1">
            <Sparkles size={11} />
            <span>High Card Arena</span>
          </div>

          {/* Side by Side Arena */}
          <div className="relative z-10 flex w-full items-center justify-around gap-2 px-1 my-auto">
            <ArenaSide
              label="Dragon"
              card={displayResult?.dragon}
              isDealing={isDealing}
              isWinner={displayResult?.winner === 'dragon'}
              emoji="🐉"
              color="#EF4444"
              cardRank={cardRank}
            />

            <div className="flex flex-col items-center px-1 z-20">
              <Motion.div
                animate={isDealing ? { scale: [1, 1.2, 1], rotate: [0, 180, 360] } : {}}
                transition={{ duration: 1.2, repeat: isDealing ? Infinity : 0 }}
                className="w-10 h-10 rounded-full bg-black/60 border-2 border-white/20 flex items-center justify-center shadow-lg"
              >
                <span className="text-xs font-black text-casino-gold italic">VS</span>
              </Motion.div>
            </div>

            <ArenaSide
              label="Tiger"
              card={displayResult?.tiger}
              isDealing={isDealing}
              isWinner={displayResult?.winner === 'tiger'}
              emoji="🐅"
              color="#F59E0B"
              cardRank={cardRank}
            />
          </div>

          {/* Winner Outcome Overlay Banner */}
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
                    displayResult.winner === 'dragon'
                      ? 'bg-gradient-to-r from-red-600 to-rose-700 border-red-400 shadow-[0_0_30px_rgba(239,68,68,0.6)]'
                      : displayResult.winner === 'tiger'
                        ? 'bg-gradient-to-r from-amber-500 to-orange-600 border-amber-300 shadow-[0_0_30px_rgba(245,158,11,0.6)]'
                        : 'bg-gradient-to-r from-emerald-600 to-teal-700 border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.6)]'
                  }`}
                >
                  🎉 {displayResult.winner === 'tie' ? 'TIE GAME (8×)!' : `${displayResult.winner.toUpperCase()} WINS!`}
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

        {/* 3 Bet Options: Dragon (1.95x), Tie (8x), Tiger (1.95x) */}
        <div className={`grid grid-cols-3 gap-2 ${!bettingOpen ? 'opacity-50 pointer-events-none' : ''}`}>
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
                className={`group relative overflow-hidden rounded-xl py-2.5 px-1.5 border transition-all duration-150 active:scale-95 cursor-pointer text-center bg-gradient-to-br ${b.gradient} ${
                  isSelected
                    ? 'ring-2 ring-casino-gold border-casino-gold shadow-glow-gold scale-[1.02]'
                    : 'border-white/10 hover:border-white/30'
                }`}
              >
                <span className="text-xl sm:text-2xl block mb-0.5">{b.emoji}</span>
                <span className="text-xs font-black uppercase text-white tracking-wide block">{b.label}</span>
                <span className="text-[9px] font-mono font-bold text-white/80 block mt-0.5 bg-black/30 px-2 py-0.5 rounded-full mx-auto w-max">
                  {b.mult}
                </span>
              </button>
            );
          })}
        </div>

        {/* Recent Outcomes History (Compact single-line ribbon) */}
        {gameHistory.length > 0 && (
          <div className="glass-panel rounded-xl p-2 border border-white/10 flex items-center justify-between gap-2 overflow-hidden shrink-0">
            <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-white/40 shrink-0">
              <History size={12} />
              <span>History</span>
            </div>
            <div className="flex gap-1.5 overflow-x-auto custom-scrollbar py-0.5">
              {gameHistory.slice(0, 10).map((h, i) => (
                <div
                  key={i}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider shrink-0 border ${
                    h.winner === 'dragon'
                      ? 'bg-red-500/20 text-red-300 border-red-500/40'
                      : h.winner === 'tiger'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  }`}
                >
                  {h.winner === 'dragon' ? '🐉 D' : h.winner === 'tiger' ? '🐅 T' : '⚖️ Tie'}
                </div>
              ))}
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
              <CheckCircle2 size={16} /> Bet Placed on {lastPlacedBet?.label || 'Dragon'} · {formatINR(lastPlacedBet?.amount || 50)}!
            </Motion.div>
          )}
        </AnimatePresence>
      </div>
    </GameLayout>
  );
};

const ArenaSide = ({ label, card, isDealing, isWinner, emoji, cardRank }) => {
  const isRedSuit = card?.suit === '♥' || card?.suit === '♦';

  return (
    <div className="flex flex-col items-center gap-1.5 flex-1">
      <span className={`text-[11px] sm:text-xs font-black uppercase tracking-wider flex items-center gap-1 ${
        isWinner ? 'text-casino-gold scale-105 animate-pulse' : 'text-white/70'
      }`}>
        <span>{emoji}</span> {label}
      </span>

      <div className="relative w-16 h-22 sm:w-20 sm:h-28">
        <Motion.div
          animate={isWinner ? { scale: [1, 1.06, 1], y: [0, -4, 0] } : {}}
          transition={{ duration: 0.6, repeat: isWinner ? Infinity : 0 }}
          className={`w-full h-full rounded-xl flex flex-col justify-between p-2 font-black border-2 transition-all shadow-xl select-none ${
            card
              ? isWinner
                ? 'bg-white border-casino-gold ring-3 ring-casino-gold/60 shadow-[0_0_20px_rgba(245,197,66,0.5)]'
                : 'bg-white border-white/40'
              : 'bg-gradient-to-br from-indigo-950 to-slate-900 border-white/15'
          } ${isRedSuit ? 'text-red-600' : 'text-slate-900'}`}
        >
          {card ? (
            <>
              <div className="flex justify-between items-start leading-none">
                <span className="text-xs sm:text-sm">{cardRank(card.value)}</span>
                <span className="text-xs sm:text-sm">{card.suit}</span>
              </div>
              <div className="text-2xl sm:text-3xl text-center leading-none my-auto">{card.suit}</div>
              <div className="flex justify-between items-end leading-none rotate-180">
                <span className="text-xs sm:text-sm">{cardRank(card.value)}</span>
                <span className="text-xs sm:text-sm">{card.suit}</span>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-white/30 text-xl font-black">
              {isDealing ? (
                <Motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="text-casino-gold text-sm"
                >
                  🎴 Dealing…
                </Motion.div>
              ) : (
                <span>🎴</span>
              )}
            </div>
          )}
        </Motion.div>
      </div>
    </div>
  );
};

export default DragonTiger;
