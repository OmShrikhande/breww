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
      <div className="flex flex-col gap-2 h-full justify-between select-none">
        <RoundStatusBar roundId={roundId} timerLeft={timerLeft} bettingOpen={bettingOpen} accent={ACCENT} />

        {/* Live Result Announcement (Compact) */}
        <AnimatePresence>
          {result && (
            <Motion.div
              initial={{ opacity: 0, scale: 0.9, y: -5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl border border-casino-gold/40 bg-gradient-to-r from-casino-gold/20 via-black/40 to-orange-500/20 p-2.5 text-center shadow-xl flex items-center justify-between px-4 relative overflow-hidden shrink-0"
            >
              <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-casino-gold">
                <Sparkles size={11} /> Outcome
              </div>

              <div className="flex items-center gap-2">
                {currentWinningInfo?.number !== undefined && (
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black text-white shadow-md border border-white/40 ${
                    getColorClass(currentWinningInfo.color)
                  }`}>
                    {currentWinningInfo.number}
                  </div>
                )}
                <div className="text-left">
                  <p className="text-sm font-black text-white uppercase tracking-tight leading-none">
                    {result}
                  </p>
                  {currentWinningInfo?.size && (
                    <p className="text-[10px] font-bold text-casino-gold uppercase tracking-wider">
                      {currentWinningInfo.size} · {currentWinningInfo.color}
                    </p>
                  )}
                </div>
              </div>
            </Motion.div>
          )}
        </AnimatePresence>

        {/* Recent Draw Ribbon (Compact single-line) */}
        {recentDots.length > 0 && (
          <div className="glass-panel rounded-xl p-2 border border-white/10 flex items-center justify-between gap-2 overflow-hidden shrink-0">
            <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-white/50 shrink-0">
              <History size={12} />
              <span>Recent</span>
            </div>
            <div className="flex gap-1.5 overflow-x-auto custom-scrollbar py-0.5">
              {recentDots.map((h, i) => (
                <div
                  key={i}
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-sm shrink-0 border border-white/20 ${
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
          <p className="text-center text-xs text-red-400 bg-red-500/15 border border-red-500/30 rounded-xl py-1.5 px-3 font-bold">
            {betError}
          </p>
        )}

        {/* Tab Selection */}
        <div className="game-glass rounded-xl p-1 border border-white/10 flex gap-1 shrink-0">
          {[
            { id: 'color', label: 'Colour (2× / 4.5×)' },
            { id: 'size', label: 'Big / Small (2×)' },
            { id: 'number', label: 'Number 0–9 (9×)' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-1.5 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === tab.id ? 'bg-white/15 text-white shadow-sm' : 'text-white/40 hover:text-white/70'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Active Board */}
        <div className={`flex-1 min-h-0 flex flex-col justify-center ${!bettingOpen ? 'opacity-50 pointer-events-none' : ''}`}>
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

        {/* Compact History Table */}
        <div className="shrink-0 max-h-36 overflow-hidden">
          <HistoryTable history={displayHistory} myBets={myBets} />
        </div>

        {/* Bet Confirmation Toast */}
        <AnimatePresence>
          {betSuccess && (
            <Motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-xs font-black text-white shadow-2xl"
            >
              <CheckCircle2 size={16} /> Bet Placed on {formatBetLabel(lastPlacedBet)} · {formatINR(lastPlacedBet?.amount || 50)}!
            </Motion.div>
          )}
        </AnimatePresence>
      </div>
    </GameLayout>
  );
};

export default ColorPrediction;
