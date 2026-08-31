import React, { useState, useEffect, useRef } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, History, RotateCcw, Sparkles } from 'lucide-react';

import GameLayout from '../GameLayout';
import RoundStatusBar from '../../components/games/RoundStatusBar';
import { useGameRound, parseDiceResult } from '../../hooks/useGameRound';
import { useRoundBetting } from '../../hooks/useRoundBetting';
import { formatBetLabel } from '../../utils/gameHelpers';
import { formatINR } from '../../utils/formatCurrency';

const GAME_ID = 'dice';
const ACCENT = '#3498DB';

const SUM_MULTIPLIERS = {
  3: 207, 4: 69, 5: 34, 6: 20, 7: 14, 8: 10, 9: 8, 10: 8,
  11: 8, 12: 8, 13: 10, 14: 14, 15: 20, 16: 34, 17: 69, 18: 207,
};

const DiceIcon = ({ value, rolling }) => {
  const dots = [[], [4], [0, 8], [0, 4, 8], [0, 2, 6, 8], [0, 2, 4, 6, 8], [0, 2, 3, 5, 6, 8]];
  const v = rolling ? Math.floor(Math.random() * 6) + 1 : value;

  return (
    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-rose-600 via-red-700 to-red-950 rounded-2xl shadow-[0_4px_15px_rgba(225,29,72,0.4)] p-2.5 border-2 border-rose-400/40 flex items-center justify-center">
      <div className="grid grid-cols-3 grid-rows-3 gap-1 h-full w-full">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="flex items-center justify-center">
            {dots[v]?.includes(i) && (
              <div className="w-2.5 h-2.5 bg-amber-300 rounded-full shadow-[0_0_6px_rgba(252,211,77,0.8)] border border-amber-100/50" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const Dice = () => {
  const { timerLeft, bettingOpen, result, history, roundId, refresh } = useGameRound(GAME_ID);
  const { placeMultipleBets, betError, betSuccess, placing } = useRoundBetting(GAME_ID);

  const [selectedBets, setSelectedBets] = useState([]);
  const [lastPlacedInfo, setLastPlacedInfo] = useState(null);
  const [isRolling, setIsRolling] = useState(false);
  const [diceResults, setDiceResults] = useState([4, 5, 3]);
  const [lastResult, setLastResult] = useState(null);
  const [tab, setTab] = useState('sum');
  const activeRoundRef = useRef(roundId);

  useEffect(() => {
    if (roundId && roundId !== activeRoundRef.current) {
      activeRoundRef.current = roundId;
      setIsRolling(false);
    }
  }, [roundId]);

  useEffect(() => {
    if (!result || result === lastResult) return;
    setLastResult(result);
    setIsRolling(true);

    const parsed = parseDiceResult(result);

    setTimeout(() => {
      setDiceResults(parsed.dice);
      setIsRolling(false);
      refresh();
    }, 1200);
  }, [result, lastResult, refresh]);

  const toggleBet = (type, value, multiplier) => {
    const idx = selectedBets.findIndex((b) => b.type === type && b.value === value);
    if (idx >= 0) setSelectedBets((p) => p.filter((_, i) => i !== idx));
    else setSelectedBets((p) => [...p, { type, value, multiplier }]);
  };

  const handlePlaceBet = async (amount) => {
    if (selectedBets.length === 0) return;
    setLastPlacedInfo({ count: selectedBets.length, total: amount * selectedBets.length });
    const ok = await placeMultipleBets(selectedBets, amount, { bettingOpen });
    if (ok) setSelectedBets([]);
  };

  const displayHistory = history.map((h) => ({ roundId: h.roundId, ...parseDiceResult(h.result) }));
  const totalSum = diceResults.reduce((a, b) => a + b, 0);

  const selectedLabel = selectedBets.length
    ? `${selectedBets.length} Bets: ` + selectedBets.map((b) => formatBetLabel(b)).join(', ')
    : '';

  return (
    <GameLayout
      title="Dice Roll"
      subtitle="3 dice · sum, size & parity bets"
      accent={ACCENT}
      onPlaceBet={handlePlaceBet}
      betDisabled={!bettingOpen || selectedBets.length === 0 || placing || isRolling}
      selectedLabel={selectedLabel}
    >
      <div className="flex flex-col gap-4 pb-4">
        <RoundStatusBar roundId={roundId} timerLeft={timerLeft} bettingOpen={bettingOpen} accent={ACCENT} />

        {/* Dice Arena Table */}
        <div className="game-glass rounded-3xl p-6 border border-white/10 flex flex-col items-center gap-4 bg-[#0d1527]/90 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-transparent to-black/40 pointer-events-none" />

          {result && !isRolling && (
            <div className="relative z-10 text-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-casino-gold flex items-center justify-center gap-1">
                <Sparkles size={12} /> Declared Outcome
              </span>
              <p className="text-xl font-black text-white uppercase mt-0.5 tracking-wide">{result}</p>
            </div>
          )}

          {/* 3 Rolling Dice */}
          <div className="relative z-10 flex gap-4 sm:gap-6 p-5 rounded-3xl bg-gradient-to-b from-emerald-950/70 to-[#072417] border-2 border-emerald-500/30 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5),0_0_25px_rgba(16,185,129,0.2)]">
            {diceResults.map((val, i) => (
              <Motion.div
                key={i}
                animate={isRolling ? { rotate: [0, 90, 180, 270, 360], y: [0, -18, 0], scale: [1, 1.15, 1] } : {}}
                transition={isRolling ? { duration: 0.35, repeat: Infinity } : {}}
              >
                <DiceIcon value={val} rolling={isRolling} />
              </Motion.div>
            ))}
          </div>

          {!isRolling && diceResults.length === 3 && (
            <div className="relative z-10 flex items-center gap-3 bg-black/40 px-4 py-1.5 rounded-full border border-white/10 text-xs font-bold text-white/70">
              <span>Sum: <strong className="text-white text-sm font-black">{totalSum}</strong></span>
              <span>·</span>
              <span className="text-emerald-400 font-black">{totalSum >= 11 ? 'BIG' : 'SMALL'}</span>
              <span>·</span>
              <span className="text-amber-400 font-black">{totalSum % 2 === 0 ? 'EVEN' : 'ODD'}</span>
            </div>
          )}
        </div>

        {betError && (
          <p className="text-center text-sm text-red-400 bg-red-500/15 border border-red-500/30 rounded-2xl py-2.5 px-4 font-bold animate-fadeIn">
            {betError}
          </p>
        )}

        {/* Multi-Selection Counter & Clear Bar */}
        {selectedBets.length > 0 && (
          <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-casino-gold/15 border border-casino-gold/30 text-xs text-casino-gold font-bold">
            <span>✨ {selectedBets.length} Bet{selectedBets.length > 1 ? 's' : ''} Selected</span>
            <button
              type="button"
              onClick={() => setSelectedBets([])}
              className="flex items-center gap-1 hover:text-white px-2 py-0.5 rounded bg-black/30 cursor-pointer"
            >
              <RotateCcw size={12} /> Clear
            </button>
          </div>
        )}

        {/* Betting Mode Switcher */}
        <div className="game-glass rounded-2xl p-1 border border-white/10 flex gap-1">
          {[
            { id: 'sum', label: 'Total Sum (3–18)' },
            { id: 'size', label: 'Big / Small / Parity' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                tab === t.id ? 'bg-white/15 text-white shadow-sm' : 'text-white/40 hover:text-white/70'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Total Sum 3-18 Grid */}
        <div className={`${!bettingOpen ? 'opacity-50 pointer-events-none' : ''}`}>
          {tab === 'sum' && (
            <div className="space-y-2">
              <p className="game-section-title">Select Total Dice Sum</p>
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(SUM_MULTIPLIERS).map(([sumStr, mult]) => {
                  const n = parseInt(sumStr, 10);
                  const isSel = selectedBets.some((b) => b.type === 'sum' && b.value === n);
                  return (
                    <button
                      key={sumStr}
                      type="button"
                      onClick={() => toggleBet('sum', n, mult)}
                      className={`bet-chip py-3.5 rounded-2xl border transition-all flex flex-col items-center active:scale-95 cursor-pointer ${
                        isSel
                          ? 'border-casino-gold bg-casino-gold/25 text-casino-gold shadow-glow-gold ring-2 ring-casino-gold scale-[1.02]'
                          : 'border-white/10 bg-white/5 text-white hover:border-white/25 hover:bg-white/10'
                      }`}
                    >
                      <span className="text-[10px] font-mono font-bold text-white/50">{mult}×</span>
                      <span className="font-black text-xl text-white mt-0.5">{sumStr}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 2: Big / Small / Even / Odd */}
          {tab === 'size' && (
            <div className="space-y-2">
              <p className="game-section-title">Select Size & Parity (2× Payout)</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { type: 'size', val: 'Small', label: 'Small (3–10)', bg: 'from-sky-600 to-blue-900', emoji: '🔹' },
                  { type: 'size', val: 'Big', label: 'Big (11–18)', bg: 'from-orange-500 to-red-800', emoji: '🔥' },
                  { type: 'parity', val: 'Even', label: 'Even', bg: 'from-emerald-600 to-green-900', emoji: '🟢' },
                  { type: 'parity', val: 'Odd', label: 'Odd', bg: 'from-violet-600 to-purple-900', emoji: '🟣' },
                ].map(({ type, val, label, bg, emoji }) => {
                  const isSel = selectedBets.some((b) => b.type === type && b.value === val);
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => toggleBet(type, val, 2)}
                      className={`py-5 px-4 rounded-2xl font-black uppercase text-white bg-gradient-to-br ${bg} border transition-all active:scale-95 cursor-pointer text-center ${
                        isSel
                          ? 'ring-2 ring-casino-gold border-casino-gold shadow-glow-gold scale-[1.02]'
                          : 'border-white/10 hover:border-white/30 hover:scale-[1.01]'
                      }`}
                    >
                      <span className="text-2xl block mb-1">{emoji}</span>
                      <span className="text-sm font-black tracking-wide block">{label}</span>
                      <span className="text-xs font-mono opacity-80 mt-0.5 block">2.00×</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* History Table */}
        {displayHistory.length > 0 && (
          <div className="glass-panel rounded-3xl p-4 sm:p-5 border border-white/10 shadow-xl">
            <div className="flex items-center gap-2 font-black text-xs text-white/60 mb-3">
              <History size={14} />
              <span>Recent Outcomes</span>
            </div>
            <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1">
              {displayHistory.slice(0, 14).map((h, i) => (
                <div
                  key={i}
                  className="px-3 py-1.5 rounded-xl text-xs font-black shrink-0 border bg-white/5 border-white/10 text-white/80"
                >
                  🎲 Sum {h.sum}
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
              className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-sm font-black text-white shadow-2xl"
            >
              <CheckCircle2 size={18} /> {lastPlacedInfo?.count || 1} Bet{lastPlacedInfo?.count > 1 ? 's' : ''} Placed · {formatINR(lastPlacedInfo?.total || 50)}!
            </Motion.div>
          )}
        </AnimatePresence>
      </div>
    </GameLayout>
  );
};

export default Dice;
