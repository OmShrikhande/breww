import React, { useState, useEffect, useRef } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Sparkles, History } from 'lucide-react';

import GameLayout from '../GameLayout';
import HistoryTable from './HistoryTable';
import RoundStatusBar from '../../components/games/RoundStatusBar';

import { useGameRound } from '../../hooks/useGameRound';
import { useRoundBetting } from '../../hooks/useRoundBetting';
import { parseColourResult, formatBetLabel, getColorClass } from '../../utils/gameHelpers';
import { formatINR } from '../../utils/formatCurrency';

const GAME_ID = 'colour';
const ACCENT = '#E74C3C';

const COLORS = [
  { value: 'Green', bg: 'from-emerald-600 to-emerald-800', ring: 'ring-emerald-400', mult: '2×', emoji: '🟢' },
  { value: 'Violet', bg: 'from-violet-600 to-purple-800', ring: 'ring-violet-400', mult: '4.5×', emoji: '🟣' },
  { value: 'Red', bg: 'from-rose-600 to-red-800', ring: 'ring-rose-400', mult: '2×', emoji: '🔴' },
];

const NUMBERS = [
  { num: 0, bg: 'bg-gradient-to-br from-violet-600 via-purple-700 to-rose-600', ring: 'ring-purple-400', border: 'border-purple-400/50' },
  { num: 1, bg: 'bg-gradient-to-br from-emerald-500 to-emerald-700', ring: 'ring-emerald-400', border: 'border-emerald-400/40' },
  { num: 2, bg: 'bg-gradient-to-br from-rose-500 to-rose-700', ring: 'ring-rose-400', border: 'border-rose-400/40' },
  { num: 3, bg: 'bg-gradient-to-br from-emerald-500 to-emerald-700', ring: 'ring-emerald-400', border: 'border-emerald-400/40' },
  { num: 4, bg: 'bg-gradient-to-br from-rose-500 to-rose-700', ring: 'ring-rose-400', border: 'border-rose-400/40' },
  { num: 5, bg: 'bg-gradient-to-br from-violet-600 via-purple-700 to-emerald-600', ring: 'ring-violet-400', border: 'border-purple-400/50' },
  { num: 6, bg: 'bg-gradient-to-br from-rose-500 to-rose-700', ring: 'ring-rose-400', border: 'border-rose-400/40' },
  { num: 7, bg: 'bg-gradient-to-br from-emerald-500 to-emerald-700', ring: 'ring-emerald-400', border: 'border-emerald-400/40' },
  { num: 8, bg: 'bg-gradient-to-br from-rose-500 to-rose-700', ring: 'ring-rose-400', border: 'border-rose-400/40' },
  { num: 9, bg: 'bg-gradient-to-br from-emerald-500 to-emerald-700', ring: 'ring-emerald-400', border: 'border-emerald-400/40' },
];

const SIZES = [
  { value: 'Big', label: 'Big (5–9)', bg: 'from-orange-500 to-amber-700', ring: 'ring-amber-400', mult: '2×' },
  { value: 'Small', label: 'Small (0–4)', bg: 'from-sky-500 to-blue-700', ring: 'ring-sky-400', mult: '2×' },
];

const ColorPrediction = () => {
  const { timerLeft, bettingOpen, result, history, roundId, refresh } = useGameRound(GAME_ID);
  const { placeBet, betError, betSuccess, placing } = useRoundBetting(GAME_ID);

  const [selectedBet, setSelectedBet] = useState(null);
  const [lastPlacedBet, setLastPlacedBet] = useState(null);
  const [lastResult, setLastResult] = useState(null);
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

  const isColorSelected = (val) => selectedBet?.type === 'color' && selectedBet?.value === val;
  const isNumberSelected = (num) => selectedBet?.type === 'number' && selectedBet?.value === num;
  const isSizeSelected = (val) => selectedBet?.type === 'size' && selectedBet?.value === val;

  return (
    <GameLayout
      title="WinGo"
      subtitle="Colour & Number prediction · 30s rounds"
      accent={ACCENT}
      onPlaceBet={handleBetClick}
      betDisabled={!bettingOpen || !selectedBet || placing}
      selectedLabel={selectedBet ? formatBetLabel(selectedBet) : ''}
    >
      <div className="flex flex-col gap-2 select-none h-full justify-between">
        {/* Top Status & Live Countdown Bar */}
        <RoundStatusBar roundId={roundId} timerLeft={timerLeft} bettingOpen={bettingOpen} accent={ACCENT} />

        {/* Live Result Announcement (Compact) */}
        <AnimatePresence>
          {result && (
            <Motion.div
              initial={{ opacity: 0, scale: 0.9, y: -5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-xl border border-casino-gold/40 bg-gradient-to-r from-casino-gold/20 via-black/40 to-orange-500/20 p-2 text-center shadow-lg flex items-center justify-between px-3 relative overflow-hidden shrink-0"
            >
              <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-casino-gold">
                <Sparkles size={11} /> Outcome
              </div>

              <div className="flex items-center gap-2">
                {currentWinningInfo?.number !== undefined && (
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white shadow-md border border-white/40 ${
                    getColorClass(currentWinningInfo.color)
                  }`}>
                    {currentWinningInfo.number}
                  </div>
                )}
                <div className="text-left">
                  <p className="text-xs font-black text-white uppercase tracking-tight leading-none">
                    {result}
                  </p>
                  {currentWinningInfo?.size && (
                    <p className="text-[9px] font-bold text-casino-gold uppercase tracking-wider">
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
          <div className="glass-panel rounded-xl p-1.5 border border-white/10 flex items-center justify-between gap-2 overflow-hidden shrink-0">
            <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-white/50 shrink-0">
              <History size={11} />
              <span>Recent</span>
            </div>
            <div className="flex gap-1 overflow-x-auto custom-scrollbar py-0.5">
              {recentDots.map((h, i) => (
                <div
                  key={i}
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black text-white shadow-sm shrink-0 border border-white/20 ${
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
          <p className="text-center text-xs text-red-400 bg-red-500/15 border border-red-500/30 rounded-xl py-1 px-3 font-bold">
            {betError}
          </p>
        )}

        {/* Unified WinGo Betting Board (Colors + Attached Numbers + Attached Big/Small) */}
        <div className={`game-glass rounded-2xl p-2.5 border border-white/10 bg-[#0d1424]/90 shadow-2xl flex flex-col gap-2 shrink-0 ${
          !bettingOpen ? 'opacity-50 pointer-events-none' : ''
        }`}>
          {/* Row 1: The Three Main Colors */}
          <div className="grid grid-cols-3 gap-2">
            {COLORS.map(({ value, bg, ring, mult }) => {
              const selected = isColorSelected(value);
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSelectedBet(selected ? null : { type: 'color', value })}
                  className={`py-2.5 sm:py-3 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-gradient-to-br ${bg} border border-white/15 shadow-md transition-all active:scale-95 cursor-pointer text-center ${
                    selected ? `ring-2 ${ring} ring-offset-1 ring-offset-black scale-[1.03] shadow-glow-gold` : 'opacity-90 hover:opacity-100'
                  }`}
                >
                  <span className="block text-xs sm:text-sm font-black">{value}</span>
                  <span className="block text-[9px] font-bold opacity-80 mt-0.5">{mult}</span>
                </button>
              );
            })}
          </div>

          {/* Row 2 & 3: Attached Numbers 0–9 (10 number badges with authentic Tiranga styling) */}
          <div className="grid grid-cols-5 gap-1.5 pt-0.5">
            {NUMBERS.map(({ num, bg, ring, border }) => {
              const selected = isNumberSelected(num);
              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => setSelectedBet(selected ? null : { type: 'number', value: num })}
                  className={`h-9 sm:h-10 rounded-xl border text-white font-black text-sm flex flex-col items-center justify-center transition-all active:scale-95 cursor-pointer relative overflow-hidden shadow-sm ${bg} ${border} ${
                    selected ? `ring-2 ring-casino-gold scale-105 shadow-glow-gold border-casino-gold z-10` : 'hover:opacity-90'
                  }`}
                >
                  <span className="leading-none text-sm sm:text-base font-black drop-shadow">{num}</span>
                  <span className="text-[7px] font-mono text-white/70 leading-none mt-0.5">9×</span>
                </button>
              );
            })}
          </div>

          {/* Row 4: Attached Big / Small (2x) */}
          <div className="grid grid-cols-2 gap-2 pt-0.5">
            {SIZES.map(({ value, label, bg, ring, mult }) => {
              const selected = isSizeSelected(value);
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSelectedBet(selected ? null : { type: 'size', value })}
                  className={`py-2 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-gradient-to-br ${bg} border border-white/15 shadow-md transition-all active:scale-95 cursor-pointer text-center ${
                    selected ? `ring-2 ${ring} ring-offset-1 ring-offset-black scale-[1.02] shadow-glow-gold` : 'opacity-90 hover:opacity-100'
                  }`}
                >
                  <span className="block text-xs font-black">{label}</span>
                  <span className="block text-[8px] opacity-80 mt-0.5">{mult}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Uplifted Game Record & My Bets Table (Directly below betting board) */}
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col justify-start">
          <HistoryTable history={displayHistory} myBets={myBets} />
        </div>

        {/* Bet Confirmation Toast */}
        <AnimatePresence>
          {betSuccess && (
            <Motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2 text-xs font-black text-white shadow-2xl"
            >
              <CheckCircle2 size={15} /> Bet Placed on {formatBetLabel(lastPlacedBet)} · {formatINR(lastPlacedBet?.amount || 50)}!
            </Motion.div>
          )}
        </AnimatePresence>
      </div>
    </GameLayout>
  );
};

export default ColorPrediction;
