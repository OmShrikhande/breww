import React, { useState, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Sparkles } from 'lucide-react';

import GameLayout from '../GameLayout';
import ColorBoard from './ColorBoard';
import SizeBoard from './SizeBoard';
import NumberBoard from './NumberBoard';
import HistoryTable from './HistoryTable';
import RoundStatusBar from '../../components/games/RoundStatusBar';

import { useGameRound } from '../../hooks/useGameRound';
import { useRoundBetting } from '../../hooks/useRoundBetting';
import { parseColourResult, formatBetLabel, getColorClass } from '../../utils/gameHelpers';

const GAME_ID = 'colour';
const ACCENT = '#E74C3C';

const ColorPrediction = () => {
  const { timerLeft, bettingOpen, result, history, roundId, refresh } = useGameRound(GAME_ID);
  const { placeBet, betError, betSuccess, placing } = useRoundBetting(GAME_ID);

  const [selectedBet, setSelectedBet] = useState(null);
  const [lastResult, setLastResult] = useState(null);
  const [activeTab, setActiveTab] = useState('color');

  useEffect(() => {
    if (result && result !== lastResult) {
      setLastResult(result);
      refresh();
    }
  }, [result, lastResult, refresh]);

  const displayHistory = history.map((h) => ({
    period: h.roundId,
    ...parseColourResult(h.result),
  }));

  const recentDots = displayHistory.slice(0, 8);

  const handleBetClick = async (amount) => {
    const ok = await placeBet(selectedBet, amount, { bettingOpen });
    if (ok) setSelectedBet(null);
  };

  return (
    <GameLayout
      title="WinGo"
      subtitle="Colour prediction · 30s rounds"
      accent={ACCENT}
      onPlaceBet={handleBetClick}
      betDisabled={!bettingOpen || !selectedBet || placing}
      selectedLabel={formatBetLabel(selectedBet)}
    >
      <div className="flex flex-col gap-4 pb-4">
        <RoundStatusBar roundId={roundId} timerLeft={timerLeft} bettingOpen={bettingOpen} accent={ACCENT} />

        <AnimatePresence>
          {result && (
            <Motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="result-pop rounded-2xl border border-casino-gold/40 bg-gradient-to-r from-casino-gold/20 to-orange-500/10 px-4 py-4 text-center"
            >
              <Sparkles size={18} className="inline text-casino-gold mb-1" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">Winning result</p>
              <p className="text-2xl font-black text-casino-gold uppercase mt-1">{result}</p>
            </Motion.div>
          )}
        </AnimatePresence>

        {recentDots.length > 0 && (
          <div className="flex gap-1.5 flex-wrap justify-center">
            {recentDots.map((h, i) => (
              <div
                key={i}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white shadow-md ${
                  typeof h.number === 'number' ? getColorClass(h.color) : 'bg-white/10'
                }`}
              >
                {typeof h.number === 'number' ? h.number : String(h.raw || '?')[0].toUpperCase()}
              </div>
            ))}
          </div>
        )}

        {betError && (
          <p className="text-center text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl py-2 px-3">
            {betError}
          </p>
        )}

        <div className="game-glass rounded-2xl p-1 border border-white/10 flex gap-1">
          {[
            { id: 'color', label: 'Colour' },
            { id: 'size', label: 'Size' },
            { id: 'number', label: 'Number' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                activeTab === tab.id ? 'bg-white/15 text-white' : 'text-white/40 hover:text-white/70'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className={`space-y-4 ${!bettingOpen ? 'opacity-60 pointer-events-none' : ''}`}>
          {activeTab === 'color' && (
            <ColorBoard selectedBet={selectedBet} onSelectBet={setSelectedBet} disabled={!bettingOpen} />
          )}
          {activeTab === 'size' && (
            <SizeBoard selectedBet={selectedBet} onSelectBet={setSelectedBet} disabled={!bettingOpen} />
          )}
          {activeTab === 'number' && (
            <NumberBoard selectedBet={selectedBet} onSelectBet={setSelectedBet} disabled={!bettingOpen} />
          )}
        </div>

        <HistoryTable history={displayHistory} />

        <AnimatePresence>
          {betSuccess && (
            <Motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
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

export default ColorPrediction;
