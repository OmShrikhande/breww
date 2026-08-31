import React, { useState, useEffect, useRef } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Sparkles, History } from 'lucide-react';

import GameLayout from '../GameLayout';
import ColorBoard from './ColorBoard';
import SizeBoard from './SizeBoard';
import NumberBoard from './NumberBoard';
import HistoryTable from './HistoryTable';
import RoundStatusBar from '../../components/games/RoundStatusBar';

import { useGameRound } from '../../hooks/useGameRound';
import { useRoundBetting } from '../../hooks/useRoundBetting';
import { parseColourResult, formatBetLabel, getColorClass } from '../../utils/gameHelpers';
import { formatINR } from '../../utils/formatCurrency';

const GAME_ID = 'colour';
const ACCENT = '#E74C3C';

const ColorPrediction = () => {
  const { timerLeft, bettingOpen, result, history, roundId, refresh } = useGameRound(GAME_ID);
  const { placeBet, betError, betSuccess, placing } = useRoundBetting(GAME_ID);

  const [selectedBet, setSelectedBet] = useState(null);
  const [lastPlacedBet, setLastPlacedBet] = useState(null);
  const [lastResult, setLastResult] = useState(null);
  const [activeTab, setActiveTab] = useState('color');
  const [myBets, setMyBets] = useState([]);
  const activeRoundRef = useRef(roundId);

  useEffect(() => {
    if (roundId && roundId !== activeRoundRef.current) {
      activeRoundRef.current = roundId;
    }
  }, [roundId]);

  useEffect(() => {
    if (result && result !== lastResult) {
      setLastResult(result);
      const parsed = parseColourResult(result);
      // Settle pending bets for this round
      setMyBets((prev) =>
        prev.map((b) => {
          if (b.status !== 'pending') return b;
          const opt = String(b.option || '').toLowerCase();
          const winColor = String(parsed.color || '').toLowerCase();
          const winNumber = String(parsed.number);
          const winSize = String(parsed.size || '').toLowerCase();

          const isWin = opt.includes(winColor) || opt.includes(winNumber) || opt.includes(winSize);
          const mult = opt.includes('violet') ? 4.5 : opt.includes('number') ? 9 : 2;
          return {
            ...b,
            status: isWin ? 'won' : 'lost',
            payout: isWin ? b.amount * mult : 0,
          };
        })
      );
      refresh();
    }
  }, [result, lastResult, refresh]);

  const displayHistory = history.map((h) => ({
    period: h.roundId,
    ...parseColourResult(h.result),
  }));

  const recentDots = displayHistory.slice(0, 10);
  const currentWinningInfo = result ? parseColourResult(result) : null;

  const handleBetClick = async (amount) => {
    if (!selectedBet) return;
    const betInfo = { ...selectedBet, amount, roundId: roundId || 'Live', id: Date.now(), status: 'pending' };
    setLastPlacedBet(betInfo);
    setMyBets((prev) => [betInfo, ...prev.slice(0, 19)]);
    const ok = await placeBet(selectedBet, amount, { bettingOpen });
    if (ok) setSelectedBet(null);
  };

  return (
    <GameLayout
      title="WinGo"
      subtitle="Colour & Number prediction · 30s rounds"
      accent={ACCENT}
      onPlaceBet={handleBetClick}
      betDisabled={!bettingOpen || !selectedBet || placing}
      selectedLabel={selectedBet ? formatBetLabel(selectedBet) : ''}
    >
      <div className="flex flex-col gap-4 pb-4">
        <RoundStatusBar roundId={roundId} timerLeft={timerLeft} bettingOpen={bettingOpen} accent={ACCENT} />

        {/* Live Result Sphere Announcement */}
        <AnimatePresence>
          {result && (
            <Motion.div
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-3xl border border-casino-gold/40 bg-gradient-to-r from-casino-gold/20 via-black/40 to-orange-500/20 p-5 text-center shadow-2xl flex flex-col items-center justify-center relative overflow-hidden"
            >
              <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-casino-gold mb-1">
                <Sparkles size={13} /> Winning Outcome
              </div>

              <div className="flex items-center gap-3 my-1">
                {currentWinningInfo?.number !== undefined && (
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-black text-white shadow-lg border-2 border-white/40 ${
                    getColorClass(currentWinningInfo.color)
                  }`}>
                    {currentWinningInfo.number}
                  </div>
                )}
                <div>
                  <p className="text-2xl font-black text-white uppercase tracking-tight leading-none">
                    {result}
                  </p>
                  {currentWinningInfo?.size && (
                    <p className="text-xs font-bold text-casino-gold uppercase tracking-wider mt-0.5">
                      {currentWinningInfo.size} · {currentWinningInfo.color}
                    </p>
                  )}
                </div>
              </div>
            </Motion.div>
          )}
        </AnimatePresence>

        {/* Recent Draw Ribbon */}
        {recentDots.length > 0 && (
          <div className="glass-panel rounded-2xl p-3 border border-white/10 flex items-center justify-between gap-2 overflow-hidden">
            <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-white/50 shrink-0">
              <History size={13} />
              <span>Recent</span>
            </div>
            <div className="flex gap-1.5 flex-wrap justify-end overflow-x-auto custom-scrollbar">
              {recentDots.map((h, i) => (
                <div
                  key={i}
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white shadow-md shrink-0 border border-white/20 ${
                    typeof h.number === 'number' ? getColorClass(h.color) : 'bg-white/10'
                  }`}
                >
                  {typeof h.number === 'number' ? h.number : String(h.raw || '?')[0].toUpperCase()}
                </div>
              ))}
            </div>
          </div>
        )}

        {betError && (
          <p className="text-center text-sm text-red-400 bg-red-500/15 border border-red-500/30 rounded-2xl py-2.5 px-4 font-bold animate-fadeIn">
            {betError}
          </p>
        )}

        {/* Tab Selection */}
        <div className="game-glass rounded-2xl p-1 border border-white/10 flex gap-1">
          {[
            { id: 'color', label: 'Colour (2× / 4.5×)' },
            { id: 'size', label: 'Big / Small (2×)' },
            { id: 'number', label: 'Number 0–9 (9×)' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === tab.id ? 'bg-white/15 text-white shadow-sm' : 'text-white/40 hover:text-white/70'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Active Board */}
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

        <HistoryTable history={displayHistory} myBets={myBets} />

        {/* Bet Confirmation Toast */}
        <AnimatePresence>
          {betSuccess && (
            <Motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-sm font-black text-white shadow-2xl"
            >
              <CheckCircle2 size={18} /> Bet Placed on {formatBetLabel(lastPlacedBet)} · {formatINR(lastPlacedBet?.amount || 50)}!
            </Motion.div>
          )}
        </AnimatePresence>
      </div>
    </GameLayout>
  );
};

export default ColorPrediction;
