import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import { Activity, CircleDollarSign, Sparkles, TrendingUp } from 'lucide-react';
import { formatINR } from '../../utils/formatCurrency';
import RiskProgress from './RiskProgress';

const statCardClass =
  'rounded-[24px] border border-[#c8a86a]/12 bg-[linear-gradient(180deg,rgba(42,42,44,0.95),rgba(18,18,18,0.92))] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]';

const useAnimatedNumber = (value, duration = 650) => {
  const [displayValue, setDisplayValue] = useState(value);
  const frameRef = useRef(0);
  const previousValueRef = useRef(value);

  useEffect(() => {
    const startValue = previousValueRef.current;
    const difference = value - startValue;
    const startTime = performance.now();

    const tick = (currentTime) => {
      const progress = Math.min(1, (currentTime - startTime) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(startValue + difference * eased);

      if (progress < 1) {
        frameRef.current = window.requestAnimationFrame(tick);
      } else {
        previousValueRef.current = value;
      }
    };

    window.cancelAnimationFrame(frameRef.current);
    frameRef.current = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(frameRef.current);
  }, [duration, value]);

  return displayValue;
};

const MultiplierDisplay = ({
  betAmount,
  multiplier,
  potentialWin,
  statusLabel,
  round,
  progressPercent,
  gameState,
  lastOutcome,
  cashoutCelebration,
}) => {
  const animatedMultiplier = useAnimatedNumber(multiplier);
  const animatedPotentialWin = useAnimatedNumber(potentialWin);
  const statusMeta =
    gameState === 'resolving'
      ? { label: 'Suspense', icon: Activity }
      : cashoutCelebration
        ? { label: 'Cashout', icon: CircleDollarSign }
        : { label: 'Multiplier', icon: TrendingUp };

  return (
    <div className="relative overflow-hidden rounded-[30px] border border-[#c8a86a]/15 bg-[linear-gradient(180deg,#111112_0%,#080808_100%)] p-4 text-white shadow-[0_18px_70px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-5">
      <div className="absolute inset-x-8 top-0 h-28 bg-[radial-gradient(circle_at_top,_rgba(200,168,106,0.14),transparent_68%)] blur-2xl" />
      <div className="absolute -right-10 top-1/2 h-36 w-36 rounded-full bg-[#b11d34]/10 blur-3xl" />
      <div className="absolute -left-6 bottom-0 h-28 w-28 rounded-full bg-[#f97316]/10 blur-3xl" />

      <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-[10px] font-black uppercase tracking-[0.4em] text-[#c8a86a]/70">Live Multiplier</div>
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-white/70">
              Round {round}
            </div>
            <div className="inline-flex items-center gap-1 rounded-full border border-[#c8a86a]/20 bg-[#c8a86a]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-[#f3d79a]">
              <statusMeta.icon size={12} />
              {statusMeta.label}
            </div>
          </div>
          <AnimatePresence initial={false} mode="sync">
            <Motion.div
              key={multiplier}
              initial={{ opacity: 0, scale: 0.88, y: 12 }}
              animate={{
                opacity: 1,
                scale: [0.92, 1.08, 1],
                y: 0,
                boxShadow:
                  lastOutcome === 'lose'
                    ? [
                        '0 0 24px rgba(248,113,113,0.12)',
                        '0 0 52px rgba(248,113,113,0.28)',
                        '0 0 24px rgba(248,113,113,0.12)',
                      ]
                    : [
                        '0 0 28px rgba(213,176,107,0.12)',
                        '0 0 58px rgba(213,176,107,0.22)',
                        '0 0 28px rgba(213,176,107,0.12)',
                      ],
              }}
              exit={{ opacity: 0, scale: 1.08, y: -12 }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
              className="mt-2 inline-flex overflow-hidden rounded-[28px] border border-[#c8a86a]/20 bg-[radial-gradient(circle_at_top,_rgba(200,168,106,0.14),transparent_58%),linear-gradient(180deg,rgba(28,28,29,0.98),rgba(10,10,10,0.98))] px-5 py-4 shadow-[0_0_45px_rgba(213,176,107,0.12)]"
            >
              <Motion.div
                animate={cashoutCelebration ? { x: ['-100%', '180%'] } : { x: '-120%' }}
                transition={{ duration: 0.85, ease: 'easeInOut' }}
                className="absolute inset-y-0 left-0 w-24 skew-x-[-18deg] bg-white/18 blur-xl"
              />
              <span className="relative bg-gradient-to-r from-white via-[#f7e1b0] to-[#d1b06d] bg-clip-text text-5xl font-black tracking-tight text-transparent sm:text-6xl">
                {animatedMultiplier.toFixed(2)}x
              </span>
            </Motion.div>
          </AnimatePresence>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.24em] text-white/75">
            <Sparkles size={14} className="text-[#f3d79a]" />
            {statusLabel}
          </div>
          <div className="mt-4 max-w-xl">
            <RiskProgress round={round} progressPercent={progressPercent} />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[420px]">
          <div className={statCardClass}>
            <div className="text-[10px] font-black uppercase tracking-[0.28em] text-[#c8a86a]/70">Bet</div>
            <div className="mt-1 text-lg font-black">{formatINR(betAmount)}</div>
          </div>
          <div className={statCardClass}>
            <div className="text-[10px] font-black uppercase tracking-[0.28em] text-[#c8a86a]/70">Multiplier</div>
            <div className="mt-1 text-lg font-black">{animatedMultiplier.toFixed(2)}x</div>
          </div>
          <div className={statCardClass}>
            <div className="text-[10px] font-black uppercase tracking-[0.28em] text-[#c8a86a]/70">Potential Win</div>
            <div className="mt-1 text-lg font-black text-emerald-200">{formatINR(animatedPotentialWin)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiplierDisplay;
