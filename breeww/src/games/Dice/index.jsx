import React, { useState, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Sparkles } from 'lucide-react';

import GameLayout from '../GameLayout';
import RoundStatusBar from '../../components/games/RoundStatusBar';
import { useGameRound, parseDiceResult } from '../../hooks/useGameRound';
import { useRoundBetting } from '../../hooks/useRoundBetting';
import { formatBetLabel } from '../../utils/gameHelpers';

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
    <div className="w-14 h-14 bg-gradient-to-br from-rose-600 to-red-900 rounded-xl shadow-lg p-2 border border-white/20">
      <div className="grid grid-cols-3 grid-rows-3 gap-0.5 h-full w-full">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="flex items-center justify-center">
            {dots[v]?.includes(i) && <div className="w-2 h-2 bg-amber-300 rounded-full shadow" />}
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
  const [isRolling, setIsRolling] = useState(false);
  const [diceResults, setDiceResults] = useState([4, 4, 4]);
  const [lastResult, setLastResult] = useState(null);
  const [tab, setTab] = useState('sum');

  useEffect(() => {
    if (!result || result === lastResult) return;
    setLastResult(result);
    setIsRolling(true);
    setTimeout(() => {
      setDiceResults(parseDiceResult(result).dice);
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
    const ok = await placeMultipleBets(selectedBets, amount, { bettingOpen });
    if (ok) setSelectedBets([]);
  };

  const displayHistory = history.map((h) => ({ roundId: h.roundId, ...parseDiceResult(h.result) }));
  const selectedLabel = selectedBets.length
    ? selectedBets.map((b) => formatBetLabel(b)).join(', ')
    : '';

  return (
    <GameLayout
      title="Dice Roll"
      subtitle="3 dice · sum & size bets"
      accent={ACCENT}
      onPlaceBet={handlePlaceBet}
      betDisabled={!bettingOpen || selectedBets.length === 0 || placing || isRolling}
      selectedLabel={selectedLabel}
    >
      <div className="flex flex-col gap-4 pb-4">
        <RoundStatusBar roundId={roundId} timerLeft={timerLeft} bettingOpen={bettingOpen} accent={ACCENT} />

        <div className="game-glass rounded-2xl p-6 border border-white/10 flex flex-col items-center gap-4">
          <AnimatePresence>
            {result && (
              <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mb-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Result</p>
                <p className="text-xl font-black text-casino-gold uppercase">{result}</p>
              </Motion.div>
            )}
          </AnimatePresence>
          <div className="flex gap-4 p-4 rounded-2xl bg-gradient-to-b from-emerald-900/40 to-emerald-950/60 border border-emerald-700/30">
            {diceResults.map((val, i) => (
              <Motion.div
                key={i}
                animate={isRolling ? { rotate: [0, 180, 360], y: [0, -12, 0] } : {}}
                transition={isRolling ? { duration: 0.3, repeat: Infinity } : {}}
              >
                <DiceIcon value={val} rolling={isRolling} />
              </Motion.div>
            ))}
          </div>
          {!isRolling && diceResults.length === 3 && (
            <p className="text-sm text-white/50">
              Sum <span className="font-black text-white">{diceResults.reduce((a, b) => a + b, 0)}</span>
            </p>
          )}
        </div>

        {betError && <p className="text-center text-sm text-red-400 bg-red-500/10 rounded-xl py-2">{betError}</p>}

        <div className="game-glass rounded-2xl p-1 border border-white/10 flex gap-1">
          {['sum', 'size'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-xl text-xs font-black uppercase ${tab === t ? 'bg-white/15 text-white' : 'text-white/40'}`}
            >
              {t === 'sum' ? 'Sum' : 'Big / Small'}
            </button>
          ))}
        </div>

        <div className={`${!bettingOpen ? 'opacity-50 pointer-events-none' : ''}`}>
          {tab === 'sum' && (
            <div>
              <p className="game-section-title">Pick total sum</p>
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(SUM_MULTIPLIERS).map(([sum, mult]) => {
                  const n = parseInt(sum, 10);
                  const sel = selectedBets.some((b) => b.type === 'sum' && b.value === n);
                  return (
                    <button
                      key={sum}
                      type="button"
                      onClick={() => toggleBet('sum', n, mult)}
                      className={`bet-chip py-3 rounded-xl border border-white/10 bg-casino-card flex flex-col items-center ${
                        sel ? 'ring-2 ring-casino-gold bg-casino-gold/10' : ''
                      }`}
                    >
                      <span className="text-[9px] text-white/40">{mult}×</span>
                      <span className="font-black text-lg text-white">{sum}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {tab === 'size' && (
            <div className="grid grid-cols-2 gap-3">
              {[
                { type: 'size', val: 'Small', bg: 'from-sky-600 to-blue-800' },
                { type: 'size', val: 'Big', bg: 'from-orange-500 to-red-700' },
                { type: 'parity', val: 'Even', bg: 'from-emerald-600 to-green-800' },
                { type: 'parity', val: 'Odd', bg: 'from-violet-600 to-purple-800' },
              ].map(({ type, val, bg }) => {
                const sel = selectedBets.some((b) => (b.type === type && b.value === val));
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => toggleBet(type, val, 2)}
                    className={`bet-chip py-5 rounded-2xl font-black uppercase text-white bg-gradient-to-br ${bg} ${
                      sel ? 'ring-2 ring-casino-gold' : ''
                    }`}
                  >
                    {val}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {displayHistory.length > 0 && (
          <div className="game-glass rounded-2xl border border-white/10 p-3">
            <p className="game-section-title mb-2">History</p>
            <div className="flex gap-2 flex-wrap">
              {displayHistory.slice(0, 12).map((h) => (
                <span key={h.roundId} className="px-2 py-1 rounded-lg bg-white/5 text-xs font-black text-white/70">
                  {h.sum}
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
              className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-black text-white"
            >
              <CheckCircle2 size={18} /> Bet confirmed
            </Motion.div>
          )}
        </AnimatePresence>
      </div>
    </GameLayout>
  );
};

export default Dice;
