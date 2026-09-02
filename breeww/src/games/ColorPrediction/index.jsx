import React, { useState, useEffect, useRef } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { Sparkles, History, CheckCircle2, Trophy, X, ChevronRight, Zap } from 'lucide-react';

import GameLayout from '../GameLayout';
import RoundStatusBar from '../../components/games/RoundStatusBar';
import HistoryTable from './HistoryTable';
import { useGameRound, parseColourResult } from '../../hooks/useGameRound';
import { useRoundBetting } from '../../hooks/useRoundBetting';
import { useAudio } from '../../context/AudioContext';
import { formatBetLabel } from '../../utils/gameHelpers';
import { formatINR } from '../../utils/formatCurrency';

const ACCENT = '#10B981';

const COLORS = [
  { value: 'green', label: 'Green', bg: 'from-emerald-500 to-emerald-700', ring: 'ring-emerald-400', mult: '2×' },
  { value: 'violet', label: 'Violet', bg: 'from-purple-500 to-indigo-700', ring: 'ring-purple-400', mult: '4.5×' },
  { value: 'red', label: 'Red', bg: 'from-rose-500 to-red-700', ring: 'ring-rose-400', mult: '2×' },
];

const SIZES = [
  { value: 'big', label: 'Big (5–9)', bg: 'from-amber-600 to-orange-700', ring: 'ring-amber-400', mult: '2×' },
  { value: 'small', label: 'Small (0–4)', bg: 'from-blue-600 to-cyan-700', ring: 'ring-cyan-400', mult: '2×' },
];

const getColorClass = (color) => {
  const c = String(color || '').toLowerCase();
  if (c.includes('violet') && c.includes('green')) return 'bg-gradient-to-r from-purple-600 to-emerald-600';
  if (c.includes('violet') && c.includes('red')) return 'bg-gradient-to-r from-purple-600 to-rose-600';
  if (c.includes('green')) return 'bg-emerald-600';
  if (c.includes('red')) return 'bg-rose-600';
  if (c.includes('violet')) return 'bg-purple-600';
  return 'bg-slate-700';
};

const ColorPrediction = () => {
  const { round, history, refresh, timerLeft, bettingOpen, result, roundId } = useGameRound('colour', { pollMs: 1500 });
  const { placeBet, placing, betSuccess, betError } = useRoundBetting('colour');
  const { playChip, playWin, playLose, playTick, playGem } = useAudio();

  const [selectedBet, setSelectedBet] = useState(null);
  const [lastPlacedBet, setLastPlacedBet] = useState(null);
  const [lastResult, setLastResult] = useState(null);
  const [latestResultInfo, setLatestResultInfo] = useState(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [roundSummary, setRoundSummary] = useState(null);
  const [myBets, setMyBets] = useState([]);
  const activeRoundRef = useRef(roundId);
  const modalTimerRef = useRef(null);

  useEffect(() => {
    if (roundId && roundId !== activeRoundRef.current) {
      activeRoundRef.current = roundId;
    }
  }, [roundId]);

  useEffect(() => {
    if (result && result !== lastResult) {
      setLastResult(result);
      playGem();
      const parsed = parseColourResult(result);
      setLatestResultInfo(parsed);

      // Settle pending bets for this round
      let anyWin = false;
      let anyBet = false;
      let totalPayout = 0;
      let totalBetAmount = 0;

      setMyBets((prev) =>
        prev.map((b) => {
          if (b.status !== 'pending') return b;
          anyBet = true;
          totalBetAmount += Number(b.amount || 0);
          const opt = String(b.option || '').toLowerCase();
          const winColor = String(parsed.color || '').toLowerCase();
          const winNumber = String(parsed.number);
          const winSize = String(parsed.size || '').toLowerCase();

          const isWin = opt.includes(winColor) || opt.includes(winNumber) || opt.includes(winSize);
          if (isWin) {
            anyWin = true;
            const mult = opt.includes('violet') ? 4.5 : opt.includes('number') ? 9 : 2;
            const payout = b.amount * mult;
            totalPayout += payout;
            return { ...b, status: 'won', payout };
          }
          return { ...b, status: 'lost', payout: 0 };
        })
      );

      if (anyWin) {
        playWin();
      } else if (anyBet) {
        playLose();
      }

      setRoundSummary({
        parsed,
        anyWin,
        anyBet,
        totalPayout,
        totalBetAmount,
        period: roundId || 'Current',
      });

      // Show result modal for a generous 8 seconds so the player can clearly see their outcome
      setShowResultModal(true);
      clearTimeout(modalTimerRef.current);
      modalTimerRef.current = setTimeout(() => {
        setShowResultModal(false);
      }, 8000);

      refresh();
    }
  }, [result, lastResult, roundId, refresh, playGem, playWin, playLose]);

  const displayHistory = history.map((h) => ({
    period: h.roundId,
    ...parseColourResult(h.result),
  }));

  const recentDots = displayHistory.slice(0, 10);

  const handleBetClick = async (amount) => {
    if (!selectedBet) return;
    playChip();
    setShowResultModal(false); // Close result modal when user places next bet
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
      <div className="flex flex-col gap-2 select-none h-full justify-between relative">
        {/* Top Status & Live Countdown Bar */}
        <RoundStatusBar roundId={roundId} timerLeft={timerLeft} bettingOpen={bettingOpen} accent={ACCENT} />

        {/* Persistent Latest Outcome Ribbon */}
        {latestResultInfo && (
          <div className="rounded-xl border border-casino-gold/30 bg-gradient-to-r from-casino-gold/15 via-[#0d1424] to-orange-500/15 p-2 px-3 flex items-center justify-between shadow-md shrink-0">
            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-casino-gold">
              <Sparkles size={12} />
              <span>Last Drawn</span>
            </div>

            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white shadow-md border border-white/40 ${
                getColorClass(latestResultInfo.color)
              }`}>
                {latestResultInfo.number}
              </div>
              <div className="text-right">
                <p className="text-xs font-black text-white uppercase tracking-tight leading-none">
                  {latestResultInfo.color}
                </p>
                <p className="text-[9px] font-bold text-casino-gold uppercase tracking-wider">
                  {latestResultInfo.size}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Recent Draw History Ribbon */}
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
            {COLORS.map(({ value, label, bg, ring, mult }) => {
              const selected = isColorSelected(value);
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    playChip();
                    setSelectedBet(selected ? null : { type: 'color', value });
                  }}
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

          {/* Row 2 & 3: Attached Numbers 0–9 */}
          <div className="grid grid-cols-5 gap-1.5 py-0.5">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
              const selected = isNumberSelected(num);
              const isVioletGreen = num === 5;
              const isVioletRed = num === 0;
              const isGreen = num % 2 !== 0 && !isVioletGreen;
              const isRed = num % 2 === 0 && !isVioletRed;

              let bgStyle = 'bg-slate-700';
              if (isVioletGreen) bgStyle = 'bg-gradient-to-tr from-purple-600 via-indigo-500 to-emerald-500';
              else if (isVioletRed) bgStyle = 'bg-gradient-to-tr from-purple-600 via-indigo-500 to-rose-500';
              else if (isGreen) bgStyle = 'bg-gradient-to-br from-emerald-600 to-teal-700';
              else if (isRed) bgStyle = 'bg-gradient-to-br from-rose-600 to-red-700';

              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => {
                    playChip();
                    setSelectedBet(selected ? null : { type: 'number', value: num });
                  }}
                  className={`h-11 rounded-xl text-white font-black flex flex-col items-center justify-center transition-all active:scale-95 cursor-pointer shadow-md border border-white/10 ${bgStyle} ${
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
                  onClick={() => {
                    playChip();
                    setSelectedBet(selected ? null : { type: 'size', value });
                  }}
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

        {/* Uplifted Game Record & My Bets Table */}
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col justify-start">
          <HistoryTable history={displayHistory} myBets={myBets} />
        </div>

        {/* Interactive WinGo Result & Victory Modal (Stays 8s with manual close) */}
        <AnimatePresence>
          {showResultModal && roundSummary && (
            <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <Motion.div
                initial={{ opacity: 0, scale: 0.85, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                className={`game-glass rounded-3xl p-5 max-w-xs w-full text-center shadow-2xl border ${
                  roundSummary.anyWin
                    ? 'border-casino-gold bg-gradient-to-b from-[#1c1836] via-[#0d1424] to-[#121c38]'
                    : 'border-white/15 bg-[#0d1424]'
                }`}
              >
                {/* Modal Header */}
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/50">
                    Period #{roundSummary.period}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowResultModal(false)}
                    className="p-1 text-white/40 hover:text-white cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Outcome Aura Banner */}
                <div className="my-2">
                  <div
                    className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center text-3xl font-black text-white shadow-2xl border-2 border-white/40 ${
                      getColorClass(roundSummary.parsed.color)
                    }`}
                  >
                    {roundSummary.parsed.number}
                  </div>
                  <h4 className="text-base font-black text-white uppercase mt-2">
                    {roundSummary.parsed.color} · {roundSummary.parsed.size}
                  </h4>
                </div>

                {/* User Win / Loss Breakdown */}
                {roundSummary.anyWin ? (
                  <div className="bg-casino-gold/15 border border-casino-gold/40 p-3 rounded-2xl my-3">
                    <div className="flex items-center justify-center gap-1 text-casino-gold font-black text-xs uppercase tracking-wider mb-1">
                      <Trophy size={14} /> Congratulations!
                    </div>
                    <span className="text-2xl font-black text-emerald-400 font-mono block">
                      +{formatINR(roundSummary.totalPayout)}
                    </span>
                    <span className="text-[10px] text-white/60 font-medium">Payout credited to wallet</span>
                  </div>
                ) : roundSummary.anyBet ? (
                  <div className="bg-red-500/10 border border-red-500/30 p-2.5 rounded-2xl my-3">
                    <span className="text-xs font-black text-red-400 uppercase block">Better Luck Next Round</span>
                    <span className="text-[10px] text-white/50">Stake: {formatINR(roundSummary.totalBetAmount)}</span>
                  </div>
                ) : (
                  <div className="bg-white/5 border border-white/10 p-2.5 rounded-2xl my-3 text-xs text-white/60">
                    Draw Completed · Ready for next round
                  </div>
                )}

                {/* Action Button */}
                <button
                  type="button"
                  onClick={() => setShowResultModal(false)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-casino-gold to-orange-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <Zap size={14} fill="currentColor" /> Continue / Bet Next Round
                </button>
              </Motion.div>
            </div>
          )}
        </AnimatePresence>

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
