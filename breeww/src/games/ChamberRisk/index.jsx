import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import { AlertTriangle, ShieldCheck, Sparkles, Volume2, VolumeX, Wallet, Zap } from 'lucide-react';
import GameLayout from '../GameLayout';
import { useAuth } from '../../context/AuthContext';
import { navigateTo } from '../../lib/navigation';
import { useWallet } from '../../hooks/useWallet';
import { formatINR } from '../../utils/formatCurrency';
import ChamberBoard from './ChamberBoard';
import ChamberControls from './ChamberControls';
import MultiplierDisplay from './MultiplierDisplay';
import ChamberHistory from './ChamberHistory';
import useChamberAudio from './useChamberAudio';
import { createChamberResult, getMultiplierForRound } from '../../engines/chamberEngine';

const initialHistory = [
  { id: 'seed-1', round: 1, multiplierLabel: '1.20x', result: 'Safe' },
  { id: 'seed-2', round: 2, multiplierLabel: '1.50x', result: 'Safe' },
  { id: 'seed-3', round: 3, multiplierLabel: '0.00x', result: 'Lose' },
];

const totalChambers = 6;
const chamberNumbers = Array.from({ length: totalChambers }, (_, index) => index + 1);
const cashoutParticles = Array.from({ length: 18 }, (_, index) => ({
  id: `cashout-particle-${index}`,
  angle: (index / 18) * Math.PI * 2,
  distance: 110 + (index % 3) * 24,
  size: 6 + (index % 4),
  delay: index * 0.02,
}));

const ChamberRisk = () => {
  const { isAuthenticated } = useAuth();
  const { balance } = useWallet();
  const [betAmount, setBetAmount] = useState(100);
  const [round, setRound] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [gameState, setGameState] = useState('idle');
  const [selectedChamber, setSelectedChamber] = useState(1);
  const [revealedChamber, setRevealedChamber] = useState(null);
  const [safeChambers, setSafeChambers] = useState([]);
  const [history, setHistory] = useState(initialHistory);
  const [statusLabel, setStatusLabel] = useState('Load your stake and begin the run');
  const [lastOutcome, setLastOutcome] = useState('idle');
  const [lastWinAmount, setLastWinAmount] = useState(null);
  const [boardCycle, setBoardCycle] = useState(0);
  const [roundPhase, setRoundPhase] = useState('idle');
  const [cashoutCelebration, setCashoutCelebration] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const resolveTimeoutRef = useRef(null);
  const resetTimeoutRef = useRef(null);
  const settleTimeoutRef = useRef(null);
  const cashoutTimeoutRef = useRef(null);
  const { playSound } = useChamberAudio(soundEnabled);

  const potentialWin = useMemo(
    () => Number((betAmount * multiplier).toFixed(2)),
    [betAmount, multiplier]
  );

  useEffect(() => {
    return () => {
      if (resolveTimeoutRef.current) window.clearTimeout(resolveTimeoutRef.current);
      if (resetTimeoutRef.current) window.clearTimeout(resetTimeoutRef.current);
      if (settleTimeoutRef.current) window.clearTimeout(settleTimeoutRef.current);
      if (cashoutTimeoutRef.current) window.clearTimeout(cashoutTimeoutRef.current);
    };
  }, []);

  const canStart = gameState === 'idle' && betAmount > 0 && betAmount <= balance;
  const canPlayRound = gameState === 'playing';
  const canCashout = gameState === 'playing' && round > 0;
  const progressPercent = Math.min(100, Math.round((round / 5) * 100));
  const statusTone =
    lastOutcome === 'lose' ? 'danger' : lastOutcome === 'safe' || lastOutcome === 'cashout' ? 'success' : 'neutral';
  const actionLabel =
    gameState === 'resolving'
      ? 'Resolving'
      : gameState === 'lost'
        ? 'Round Lost'
        : canCashout
          ? 'Cashout Ready'
          : gameState === 'playing'
            ? 'Select And Advance'
            : 'Awaiting Bet';

  const handleQuickBet = (amount) => {
    setBetAmount(amount);
  };

  const handleStartGame = () => {
    if (!isAuthenticated) {
      navigateTo('/login');
      return;
    }
    if (!canStart) {
      setStatusLabel(
        betAmount > balance
          ? 'Insufficient balance for this stake'
          : 'Enter a valid amount to start'
      );
      return;
    }

    setRound(0);
    setMultiplier(1);
    setGameState('playing');
    setRevealedChamber(null);
    setSafeChambers([]);
    setLastOutcome('idle');
    setLastWinAmount(null);
    setCashoutCelebration(false);
    setRoundPhase('selection');
    setStatusLabel('Game started. Pick a chamber and continue the climb.');
    playSound('spin');
  };

  const handleNextRound = () => {
    if (!canPlayRound) return;

    if (resolveTimeoutRef.current) window.clearTimeout(resolveTimeoutRef.current);
    if (resetTimeoutRef.current) window.clearTimeout(resetTimeoutRef.current);
    if (settleTimeoutRef.current) window.clearTimeout(settleTimeoutRef.current);

    setGameState('resolving');
    setRevealedChamber(null);
    setSafeChambers([]);
    setCashoutCelebration(false);
    setBoardCycle((current) => current + 1);
    setRoundPhase('rotating');
    setStatusLabel(`Rotating chambers. Tracking slot ${selectedChamber}...`);
    playSound('spin');

    const result = createChamberResult(selectedChamber - 1, totalChambers);
    const losingChamber = result.losingChamber + 1;

    resolveTimeoutRef.current = window.setTimeout(() => {
      const revealedSafeChambers = chamberNumbers.filter((chamber) => chamber !== losingChamber);
      setRoundPhase('reveal');
      setRevealedChamber(losingChamber);
      setSafeChambers(revealedSafeChambers);

      if (result.isSafe) {
        const nextRound = round + 1;
        const nextMultiplier = getMultiplierForRound(nextRound);

        setRound(nextRound);
        setMultiplier(nextMultiplier);
        setLastOutcome('safe');
        setStatusLabel(`Safe chambers lit up. Multiplier boosted to ${nextMultiplier.toFixed(2)}x.`);
        playSound('safe');
        setHistory((currentHistory) => [
          {
            id: `round-${Date.now()}`,
            round: nextRound,
            multiplierLabel: `${nextMultiplier.toFixed(2)}x`,
            result: 'Safe',
          },
          ...currentHistory,
        ].slice(0, 10));

        settleTimeoutRef.current = window.setTimeout(() => {
          setGameState('playing');
          setRoundPhase('selection');
        }, 1050);
      } else {
        const nextRound = round + 1;

        setRound(nextRound);
        setMultiplier(0);
        setGameState('lost');
        setLastOutcome('lose');
        setStatusLabel(`Chamber ${losingChamber} detonated. Round lost.`);
        playSound('lose');
        setHistory((currentHistory) => [
          {
            id: `round-${Date.now()}`,
            round: nextRound,
            multiplierLabel: '0.00x',
            result: 'Lose',
          },
          ...currentHistory,
        ].slice(0, 10));

        resetTimeoutRef.current = window.setTimeout(() => {
          setGameState('idle');
          setRevealedChamber(null);
          setSafeChambers([]);
          setMultiplier(1);
          setRound(0);
          setLastOutcome('idle');
          setRoundPhase('idle');
          setStatusLabel('Load your stake and begin the run');
        }, 1800);
      }
    }, 1200);
  };

  const handleCashout = () => {
    if (!canCashout) return;

    const winAmount = betAmount * multiplier;
    setLastWinAmount(winAmount);
    setCashoutCelebration(true);
    setGameState('idle');
    setLastOutcome('cashout');
    setRoundPhase('cashout');
    setStatusLabel(`Cashed out ${formatINR(winAmount)} at ${multiplier.toFixed(2)}x.`);
    setRevealedChamber(null);
    setSafeChambers([]);
    setRound(0);
    setMultiplier(1);
    playSound('cashout');

    if (cashoutTimeoutRef.current) window.clearTimeout(cashoutTimeoutRef.current);
    cashoutTimeoutRef.current = window.setTimeout(() => {
      setCashoutCelebration(false);
      setRoundPhase('idle');
    }, 2200);
  };

  const statCards = useMemo(
    () => [
      { label: 'Wallet', value: formatINR(balance), icon: ShieldCheck },
      { label: 'Active Bet', value: formatINR(betAmount), icon: Zap },
      { label: 'Max Potential', value: formatINR(potentialWin), icon: AlertTriangle },
    ],
    [balance, betAmount, potentialWin]
  );

  return (
    <GameLayout title="CHAMBER RISK" isWide hideBetPanel>
      <div className="min-h-full bg-[radial-gradient(circle_at_top,_rgba(127,29,29,0.18),transparent_24%),radial-gradient(circle_at_bottom,_rgba(251,146,60,0.12),transparent_28%),linear-gradient(180deg,#050505_0%,#0B0B0D_36%,#160A08_100%)] px-3 py-4 text-white sm:px-4 lg:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden rounded-[34px] border border-[#c8a86a]/15 bg-[linear-gradient(180deg,rgba(17,17,18,0.98),rgba(8,8,9,0.96))] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.45)] sm:p-5">
            <div className="absolute inset-x-0 bottom-0 h-24 bg-[radial-gradient(circle_at_bottom,_rgba(249,115,22,0.16),transparent_68%)]" />
            <div className="absolute inset-x-0 top-0 h-10 bg-[linear-gradient(90deg,rgba(255,255,255,0.04),transparent,rgba(255,255,255,0.04))]" />
            <div className="relative rounded-[28px] border border-white/6 bg-[#050505]">
              <div className="flex items-center justify-between gap-3 border-b border-white/8 bg-[linear-gradient(180deg,#141414,#090909)] px-4 py-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSoundEnabled((current) => !current)}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/6 text-white transition-colors hover:bg-white/10"
                    aria-label={soundEnabled ? 'Mute sound' : 'Enable sound'}
                  >
                    {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                  </button>
                  <div className="rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.26em] text-emerald-200">
                    Live table
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-black uppercase tracking-[0.28em] text-white sm:text-base">Place Your Bets</div>
                  <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.28em] text-[#c8a86a]/75">
                    AAA survival table
                  </div>
                </div>
                <div className="rounded-full border border-[#c8a86a]/40 bg-[#c8a86a]/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.28em] text-[#f3d79a]">
                  Lobby
                </div>
              </div>

              <div className="flex flex-col gap-4 px-4 py-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.44em] text-[#c8a86a]/70">Survival Multiplier</div>
                  <h1 className="mt-1 bg-gradient-to-r from-white via-[#f7e1b0] to-[#d1b06d] bg-clip-text text-3xl font-black tracking-tight text-transparent sm:text-4xl">
                    Chamber Risk
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm font-semibold text-white/58">
                    Modern crypto-casino suspense with backend-ready round states, chamber reveals, cashout pressure, and a darker table-first visual system.
                  </p>
                  <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#c8a86a]/20 bg-[#c8a86a]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-[#f3d79a]">
                    <Sparkles size={14} />
                  </div>
                </div>

                <div className="grid gap-2 sm:grid-cols-3">
                {statCards.map((stat) => (
                  <div key={stat.label} className="rounded-[22px] border border-[#c8a86a]/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] px-4 py-3">
                    <div className="flex items-center gap-2 text-[#f3d79a]">
                      <stat.icon size={15} />
                      <span className="text-[10px] font-black uppercase tracking-[0.28em] text-[#c8a86a]/70">{stat.label}</span>
                    </div>
                    <div className="mt-2 text-lg font-black text-white">{stat.value}</div>
                  </div>
                ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-4">
              <MultiplierDisplay
                betAmount={betAmount}
                multiplier={multiplier}
                potentialWin={potentialWin}
                statusLabel={statusLabel}
                round={round}
                progressPercent={progressPercent}
                gameState={gameState}
                lastOutcome={lastOutcome}
                cashoutCelebration={cashoutCelebration}
              />

              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
                <ChamberBoard
                  selectedChamber={selectedChamber}
                  revealedChamber={revealedChamber}
                  safeChambers={safeChambers}
                  phase={roundPhase}
                  cycle={boardCycle}
                  onSelectChamber={setSelectedChamber}
                  disabled={gameState === 'resolving' || gameState === 'lost'}
                />

                <ChamberControls
                  betAmount={betAmount}
                  onBetAmountChange={setBetAmount}
                  onQuickBet={handleQuickBet}
                  onStartGame={handleStartGame}
                  onNextRound={handleNextRound}
                  onCashout={handleCashout}
                  selectedChamber={selectedChamber}
                  statusTone={statusTone}
                  canStart={canStart}
                  canPlayRound={canPlayRound}
                  canCashout={canCashout}
                  gameState={gameState}
                  round={round}
                  multiplier={multiplier}
                  actionLabel={actionLabel}
                />
              </div>
            </div>

            <ChamberHistory entries={history} />
          </div>
        </div>

        <AnimatePresence>
          {cashoutCelebration && lastWinAmount && (
            <>
              <Motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="pointer-events-none fixed inset-0 z-[70] bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.18),transparent_42%)]"
              />
              {cashoutParticles.map((particle) => (
                <Motion.span
                  key={particle.id}
                  initial={{ opacity: 0, x: 0, y: 0, scale: 0.4 }}
                  animate={{
                    opacity: [0, 1, 0],
                    x: Math.cos(particle.angle) * particle.distance,
                    y: Math.sin(particle.angle) * particle.distance,
                    scale: [0.4, 1, 0.75],
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.4, delay: particle.delay, ease: 'easeOut' }}
                  className="pointer-events-none fixed left-1/2 top-1/2 z-[78] rounded-full bg-[linear-gradient(135deg,#fde68a_0%,#34d399_52%,#38bdf8_100%)]"
                  style={{ width: particle.size, height: particle.size }}
                />
              ))}
              <Motion.div
                initial={{ opacity: 0, scale: 0.82, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -16 }}
                transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                className="pointer-events-none fixed bottom-6 left-1/2 z-[80] w-[min(94vw,470px)] -translate-x-1/2 overflow-hidden rounded-[30px] border border-emerald-300/30 bg-[linear-gradient(180deg,rgba(16,185,129,0.98),rgba(5,150,105,0.92))] px-6 py-5 text-center text-white shadow-[0_24px_80px_rgba(16,185,129,0.28)]"
              >
                <Motion.div
                  animate={{ x: ['-100%', '140%'] }}
                  transition={{ duration: 1.1, repeat: Infinity, repeatDelay: 0.35, ease: 'easeInOut' }}
                  className="absolute inset-y-0 left-0 w-28 skew-x-[-18deg] bg-white/20 blur-xl"
                />
                <div className="relative flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.36em] text-emerald-50/85">
                  <Wallet size={15} />
                  Cashout Success
                </div>
                <div className="relative mt-3 text-3xl font-black sm:text-4xl">YOU WON {formatINR(lastWinAmount)}</div>
                <div className="relative mt-2 text-sm font-semibold text-emerald-50/85">
                  Wallet locked the win before the chamber burst.
                </div>
              </Motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </GameLayout>
  );
};

export default ChamberRisk;
