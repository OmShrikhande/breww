import React, { useState, useEffect, useRef } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, History, RotateCcw, Sparkles } from 'lucide-react';

import GameLayout from '../GameLayout';
import RoundStatusBar from '../../components/games/RoundStatusBar';
import { useGameRound, parseDiceResult } from '../../hooks/useGameRound';
import { useRoundBetting } from '../../hooks/useRoundBetting';
import { useAudio } from '../../context/AudioContext';
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
    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-rose-600 via-red-700 to-red-950 rounded-xl shadow-[0_3px_10px_rgba(225,29,72,0.4)] p-1.5 border-2 border-rose-400/40 flex items-center justify-center">
      <div className="grid grid-cols-3 grid-rows-3 gap-0.5 h-full w-full">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="flex items-center justify-center">
            {dots[v]?.includes(i) && (
              <div className="w-2 h-2 bg-amber-300 rounded-full shadow-[0_0_4px_rgba(252,211,77,0.8)] border border-amber-100/50" />
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
  const { playChip, playDiceShake, playDiceRoll, playWin, playLose, playTick } = useAudio();

  const [selectedBets, setSelectedBets] = useState([]);
  const [lastPlacedInfo, setLastPlacedInfo] = useState(null);
  const [lastPlacedBetsList, setLastPlacedBetsList] = useState([]);
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
    if (timerLeft > 0 && timerLeft <= 5) {
      playTick(true);
    }
  }, [timerLeft, playTick]);

  useEffect(() => {
    if (!result || result === lastResult) return;
    setLastResult(result);
    setIsRolling(true);
    playDiceShake();
    setTimeout(() => playDiceRoll(), 400);

    const parsed = parseDiceResult(result);

    setTimeout(() => {
      setDiceResults(parsed.dice);
      setIsRolling(false);
      
      // Check win for user's bets
      if (lastPlacedBetsList.length > 0) {
        const sum = parsed.sum;
        const size = sum >= 11 ? 'big' : 'small';
        const parity = sum % 2 === 0 ? 'even' : 'odd';
        const won = lastPlacedBetsList.some((b) => {
          if (b.type === 'sum' && Number(b.value) === sum) return true;
          if (b.type === 'size' && String(b.value).toLowerCase() === size) return true;
          if (b.type === 'parity' && String(b.value).toLowerCase() === parity) return true;
          return false;
        });
        if (won) {
          playWin();
        } else {
          playLose();
        }
      }
      refresh();
    }, 1200);
  }, [result, lastResult, refresh, playDiceShake, playDiceRoll, playWin, playLose, lastPlacedBetsList]);

  const toggleBet = (type, value, multiplier) => {
    playChip();
    const idx = selectedBets.findIndex((b) => b.type === type && b.value === value);
    if (idx >= 0) setSelectedBets((p) => p.filter((_, i) => i !== idx));
    else setSelectedBets((p) => [...p, { type, value, multiplier }]);
  };

  const handlePlaceBet = async (amount) => {
    if (selectedBets.length === 0) return;
    playChip();
    setLastPlacedInfo({ count: selectedBets.length, total: amount * selectedBets.length });
    setLastPlacedBetsList([...selectedBets]);
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
      <div className="flex flex-col gap-2 h-full justify-between select-none">
        <RoundStatusBar roundId={roundId} timerLeft={timerLeft} bettingOpen={bettingOpen} accent={ACCENT} />

        {/* Dice Arena Table (Compact height) */}
        <div className="game-glass rounded-2xl p-2.5 border border-white/10 flex flex-col items-center gap-2 bg-[#0d1527]/90 shadow-2xl relative overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-transparent to-black/40 pointer-events-none" />

          {/* 3 Rolling Dice */}
          <div className="relative z-10 flex gap-3 sm:gap-5 p-3 rounded-2xl bg-gradient-to-b from-emerald-950/70 to-[#072417] border-2 border-emerald-500/30 shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)]">
            {diceResults.map((val, i) => (
              <Motion.div
                key={i}
                animate={isRolling ? { rotate: [0, 90, 180, 270, 360], y: [0, -12, 0], scale: [1, 1.1, 1] } : {}}
                transition={isRolling ? { duration: 0.35, repeat: Infinity } : {}}
              >
                <DiceIcon value={val} rolling={isRolling} />
              </Motion.div>
            ))}
          </div>

          {!isRolling && diceResults.length === 3 && (
            <div className="relative z-10 flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full border border-white/10 text-[11px] font-bold text-white/70">
              <span>Sum: <strong className="text-white text-xs font-black">{totalSum}</strong></span>
              <span>·</span>
              <span className="text-emerald-400 font-black">{totalSum >= 11 ? 'BIG' : 'SMALL'}</span>
              <span>·</span>
              <span className="text-amber-400 font-black">{totalSum % 2 === 0 ? 'EVEN' : 'ODD'}</span>
            </div>
          )}
        </div>

        {betError && (
          <p className="text-center text-xs text-red-400 bg-red-500/15 border border-red-500/30 rounded-xl py-1.5 px-3 font-bold">
            {betError}
          </p>
        )}

        {/* Tab & Clear Bar */}
        <div className="flex items-center justify-between gap-1">
          <div className="flex gap-1 flex-1">
            {[
              { id: 'sum', label: 'Sum (3–18)' },
              { id: 'size', label: 'Big / Small (2×)' },
              { id: 'parity', label: 'Even / Odd (2×)' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  tab === t.id ? 'bg-white/15 text-white shadow-sm' : 'text-white/40 hover:text-white/70'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          {selectedBets.length > 0 && (
            <button
              type="button"
              onClick={() => setSelectedBets([])}
              className="flex items-center gap-1 text-[10px] font-black text-rose-400 hover:text-rose-300 px-2 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 cursor-pointer"
            >
              <RotateCcw size={10} /> Clear ({selectedBets.length})
            </button>
          )}
        </div>

        {/* Bet Selection Options (Compact grid) */}
        <div className={`flex-1 min-h-0 flex flex-col justify-center ${!bettingOpen ? 'opacity-50 pointer-events-none' : ''}`}>
          {tab === 'sum' && (
            <div className="grid grid-cols-4 gap-1.5">
              {Object.entries(SUM_MULTIPLIERS).map(([sum, mult]) => {
                const isSelected = selectedBets.some((b) => b.type === 'sum' && b.value === sum);
                return (
                  <button
                    key={sum}
                    type="button"
                    onClick={() => toggleBet('sum', sum, `${mult}×`)}
                    className={`py-2 px-1 rounded-xl text-center border transition-all active:scale-95 cursor-pointer ${
                      isSelected
                        ? 'border-casino-gold bg-casino-gold/25 text-casino-gold shadow-glow-gold'
                        : 'border-white/10 bg-white/5 text-white/80 hover:border-white/20'
                    }`}
                  >
                    <span className="text-xs font-black block">{sum}</span>
                    <span className="text-[9px] font-mono text-white/50 block">{mult}×</span>
                  </button>
                );
              })}
            </div>
          )}

          {tab === 'size' && (
            <div className="grid grid-cols-2 gap-2 my-auto">
              {[
                { value: 'big', label: 'Big (11–17)', mult: '2×', color: 'from-amber-600 to-orange-800' },
                { value: 'small', label: 'Small (4–10)', mult: '2×', color: 'from-blue-600 to-indigo-800' },
              ].map((b) => {
                const isSelected = selectedBets.some((x) => x.type === 'size' && x.value === b.value);
                return (
                  <button
                    key={b.value}
                    type="button"
                    onClick={() => toggleBet('size', b.value, b.mult)}
                    className={`py-4 rounded-xl border bg-gradient-to-br ${b.color} transition-all active:scale-95 cursor-pointer text-center ${
                      isSelected ? 'ring-2 ring-casino-gold border-casino-gold shadow-glow-gold' : 'border-white/10'
                    }`}
                  >
                    <span className="text-sm font-black text-white block uppercase">{b.label}</span>
                    <span className="text-xs font-mono font-bold text-white/80 block mt-1">{b.mult}</span>
                  </button>
                );
              })}
            </div>
          )}

          {tab === 'parity' && (
            <div className="grid grid-cols-2 gap-2 my-auto">
              {[
                { value: 'even', label: 'Even', mult: '2×', color: 'from-emerald-600 to-teal-800' },
                { value: 'odd', label: 'Odd', mult: '2×', color: 'from-purple-600 to-pink-800' },
              ].map((b) => {
                const isSelected = selectedBets.some((x) => x.type === 'parity' && x.value === b.value);
                return (
                  <button
                    key={b.value}
                    type="button"
                    onClick={() => toggleBet('parity', b.value, b.mult)}
                    className={`py-4 rounded-xl border bg-gradient-to-br ${b.color} transition-all active:scale-95 cursor-pointer text-center ${
                      isSelected ? 'ring-2 ring-casino-gold border-casino-gold shadow-glow-gold' : 'border-white/10'
                    }`}
                  >
                    <span className="text-sm font-black text-white block uppercase">{b.label}</span>
                    <span className="text-xs font-mono font-bold text-white/80 block mt-1">{b.mult}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Outcomes History (Compact single-line ribbon) */}
        {displayHistory.length > 0 && (
          <div className="glass-panel rounded-xl p-2 border border-white/10 flex items-center justify-between gap-2 overflow-hidden shrink-0">
            <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-white/40 shrink-0">
              <History size={12} />
              <span>History</span>
            </div>
            <div className="flex gap-1.5 overflow-x-auto custom-scrollbar py-0.5">
              {displayHistory.slice(0, 10).map((h, i) => (
                <div
                  key={i}
                  className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase shrink-0 border border-white/10 bg-white/5 text-white/80 flex items-center gap-1"
                >
                  <span className="text-casino-gold font-bold">{h.sum}</span>
                  <span className="text-white/40">·</span>
                  <span className={h.size === 'Big' ? 'text-amber-400' : 'text-blue-400'}>{h.size[0]}</span>
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
              <CheckCircle2 size={16} /> Placed {lastPlacedInfo?.count} Bet(s) · {formatINR(lastPlacedInfo?.total || 50)}!
            </Motion.div>
          )}
        </AnimatePresence>
      </div>
    </GameLayout>
  );
};

export default Dice;
