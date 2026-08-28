import React, { useState, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, History } from 'lucide-react';

import GameLayout from '../GameLayout';
import RoundStatusBar from '../../components/games/RoundStatusBar';
import { useGameRound, parseDragonTigerResult } from '../../hooks/useGameRound';
import { useRoundBetting } from '../../hooks/useRoundBetting';
import { formatBetLabel } from '../../utils/gameHelpers';

const GAME_ID = 'dragon-tiger';
const ACCENT = '#9B59B6';

const BETS = [
  { type: 'dragon', label: 'Dragon', mult: '1.95×', gradient: 'from-red-600 to-rose-900', emoji: '🐉' },
  { type: 'tie', label: 'Tie', mult: '8×', gradient: 'from-emerald-600 to-green-900', emoji: '⚖️' },
  { type: 'tiger', label: 'Tiger', mult: '1.95×', gradient: 'from-amber-500 to-orange-800', emoji: '🐅' },
];

const DragonTiger = () => {
  const { timerLeft, bettingOpen, result, history, roundId, refresh } = useGameRound(GAME_ID);
  const { placeBet, betError, betSuccess, placing } = useRoundBetting(GAME_ID);

  const [selectedBet, setSelectedBet] = useState(null);
  const [displayResult, setDisplayResult] = useState(null);
  const [isDealing, setIsDealing] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  useEffect(() => {
    if (!result || result === lastResult) return;
    setLastResult(result);
    setIsDealing(true);
    setTimeout(() => {
      setDisplayResult(parseDragonTigerResult(result, roundId));
      setIsDealing(false);
      refresh();
      setTimeout(() => setDisplayResult(null), 5000);
    }, 1400);
  }, [result, lastResult, roundId, refresh]);

  const gameHistory = history.map((h) => parseDragonTigerResult(h.result, h.roundId));

  const handleBetClick = async (amount) => {
    const bet = { type: 'side', value: selectedBet?.type };
    const ok = await placeBet(bet, amount, { bettingOpen });
    if (ok) setSelectedBet(null);
  };

  const cardDisplay = (val) => {
    if (val === 1) return 'A';
    if (val === 11) return 'J';
    if (val === 12) return 'Q';
    if (val === 13) return 'K';
    return val;
  };

  return (
    <GameLayout
      title="Dragon Tiger"
      subtitle="High card wins · 30s rounds"
      accent={ACCENT}
      onPlaceBet={handleBetClick}
      betDisabled={!bettingOpen || !selectedBet || placing || isDealing}
      selectedLabel={selectedBet ? formatBetLabel({ type: 'side', value: selectedBet.type }) : ''}
    >
      <div className="flex flex-col gap-4 pb-4">
        <RoundStatusBar roundId={roundId} timerLeft={timerLeft} bettingOpen={bettingOpen} accent={ACCENT} />

        <div className="game-glass rounded-3xl p-6 border border-white/10 relative min-h-[320px] flex flex-col items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-5 pointer-events-none flex justify-between px-4 items-center text-[120px]">
            <span>🐉</span>
            <span>🐅</span>
          </div>

          <div className="relative z-10 flex w-full items-center justify-between gap-2 px-2">
            <ArenaSide
              label="Dragon"
              card={displayResult?.dragon}
              isDealing={isDealing && !displayResult}
              isWinner={displayResult?.winner === 'dragon'}
              side="dragon"
              cardDisplay={cardDisplay}
            />
            <div className="flex flex-col items-center px-2">
              <Motion.span
                animate={isDealing ? { rotate: 360 } : {}}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="text-2xl font-black text-white/20 italic"
              >
                VS
              </Motion.span>
            </div>
            <ArenaSide
              label="Tiger"
              card={displayResult?.tiger}
              isDealing={isDealing && !displayResult}
              isWinner={displayResult?.winner === 'tiger'}
              side="tiger"
              cardDisplay={cardDisplay}
            />
          </div>

          <AnimatePresence>
            {displayResult && (
              <Motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`mt-6 px-8 py-2.5 rounded-full font-black uppercase tracking-widest text-sm border-2 result-pop ${
                  displayResult.winner === 'dragon'
                    ? 'bg-red-600/90 border-red-400 text-white'
                    : displayResult.winner === 'tiger'
                      ? 'bg-amber-500/90 border-amber-300 text-white'
                      : 'bg-emerald-600/90 border-emerald-400 text-white'
                }`}
              >
                {displayResult.winner === 'tie' ? 'Tie!' : `${displayResult.winner} wins`}
              </Motion.div>
            )}
          </AnimatePresence>
        </div>

        {betError && <p className="text-center text-sm text-red-400 bg-red-500/10 rounded-xl py-2 px-3">{betError}</p>}

        <div className={`grid grid-cols-3 gap-3 ${!bettingOpen ? 'opacity-50 pointer-events-none' : ''}`}>
          {BETS.map((b) => {
            const sel = selectedBet?.type === b.type;
            return (
              <button
                key={b.type}
                type="button"
                onClick={() => setSelectedBet(b)}
                className={`bet-chip relative overflow-hidden rounded-2xl py-5 border border-white/10 bg-gradient-to-br ${b.gradient} ${
                  sel ? 'ring-2 ring-casino-gold scale-[1.03]' : ''
                }`}
              >
                <span className="text-2xl block mb-1">{b.emoji}</span>
                <span className="text-xs font-black uppercase text-white tracking-wider">{b.label}</span>
                <span className="text-[10px] text-white/70 block mt-0.5">{b.mult}</span>
              </button>
            );
          })}
        </div>

        {gameHistory.length > 0 && (
          <div className="game-glass rounded-2xl border border-white/10 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
              <History size={14} className="text-white/40" />
              <span className="text-xs font-black uppercase tracking-widest text-white/40">Recent</span>
            </div>
            <div className="flex gap-2 p-3 flex-wrap">
              {gameHistory.slice(0, 15).map((h, i) => (
                <span
                  key={i}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black text-white ${
                    h.winner === 'dragon' ? 'bg-red-600' : h.winner === 'tiger' ? 'bg-amber-500' : 'bg-emerald-600'
                  }`}
                >
                  {h.winner[0].toUpperCase()}
                </span>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence>
          {betSuccess && (
            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-black text-white shadow-glow"
            >
              <CheckCircle2 size={18} /> Bet confirmed
            </Motion.div>
          )}
        </AnimatePresence>
      </div>
    </GameLayout>
  );
};

const ArenaSide = ({ label, card, isDealing, isWinner, side, cardDisplay }) => {
  const isRed = card?.suit === '♥' || card?.suit === '♦';
  return (
    <div className="flex flex-col items-center gap-3 flex-1">
      <span className={`text-xs font-black uppercase tracking-[0.2em] ${isWinner ? 'text-casino-gold' : 'text-white/50'}`}>
        {label}
      </span>
      <div className="relative w-24 h-36">
        <Motion.div
          animate={{ rotateY: card ? 180 : 0, scale: isWinner ? 1.05 : 1 }}
          transition={{ duration: 0.6 }}
          style={{ transformStyle: 'preserve-3d' }}
          className="w-full h-full relative"
        >
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-950 to-slate-900 border-2 border-indigo-500/30 flex items-center justify-center backface-hidden">
            <span className="text-3xl font-black italic text-indigo-400/50">B</span>
          </div>
          <div className="absolute inset-0 rounded-xl bg-white border border-gray-200 flex flex-col p-2 backface-hidden rotate-y-180 shadow-xl">
            {card && (
              <>
                <span className={`text-lg font-black ${isRed ? 'text-red-500' : 'text-gray-900'}`}>
                  {cardDisplay(card.value)}
                </span>
                <span className={`text-sm ${isRed ? 'text-red-500' : 'text-gray-900'}`}>{card.suit}</span>
                <div className="flex-1 flex items-center justify-center text-4xl">{card.suit}</div>
              </>
            )}
          </div>
        </Motion.div>
        {isDealing && (
          <Motion.div
            initial={{ y: -200, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="absolute inset-0 rounded-xl bg-indigo-950 border-2 border-indigo-400/40 flex items-center justify-center z-10"
          >
            <span className="text-indigo-300 font-black animate-pulse">…</span>
          </Motion.div>
        )}
      </div>
    </div>
  );
};

export default DragonTiger;
