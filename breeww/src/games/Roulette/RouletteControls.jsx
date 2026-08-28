import React from 'react';
import { motion as Motion } from 'framer-motion';
import { CircleX, RotateCcw, Shuffle, Sparkles, Target, TimerReset, Trash2 } from 'lucide-react';

const controlButtons = [
  { id: 'racetrack', label: 'Racetrack', icon: Target, disabled: true },
  { id: 'special', label: 'Special Bets', icon: Sparkles, disabled: true },
  { id: 'clear', label: 'Clear', icon: Trash2 },
  { id: 'undo', label: 'Undo', icon: RotateCcw },
  { id: 'random', label: 'Random', icon: Shuffle, disabled: true },
  { id: 'double', label: 'Double', icon: TimerReset },
];

const RouletteControls = React.memo(
  ({ onAction, onSpin, isSpinning, canSpin, canUndo, canClear, canDouble }) => {
    const disabledById = {
      clear: !canClear || isSpinning,
      undo: !canUndo || isSpinning,
      double: !canDouble || isSpinning,
      racetrack: true,
      special: true,
      random: true,
    };

    return (
      <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(14,14,15,0.98),rgba(7,7,8,0.96))] p-2.5 text-white shadow-[0_18px_70px_rgba(0,0,0,0.32)] sm:rounded-[28px] sm:p-3">
        <div className="text-center text-[9px] font-black uppercase tracking-[0.24em] text-[#d8bb82]/75 sm:text-[10px] sm:tracking-[0.28em]">Controls</div>
        <div className="mt-3 grid grid-cols-1 gap-2">
          {controlButtons.map((button) => {
            const Icon = button.icon;
            const isDisabled = disabledById[button.id] ?? button.disabled;

            return (
              <Motion.button
                key={button.id}
                type="button"
                onClick={() => onAction(button.id)}
                disabled={isDisabled}
                whileHover={!isDisabled ? { y: -2, scale: 1.02 } : undefined}
                whileTap={!isDisabled ? { scale: 0.98 } : undefined}
                className={`flex flex-col items-center justify-center rounded-[18px] border px-1.5 py-2.5 text-center transition-all sm:rounded-[22px] sm:px-2 sm:py-3 ${
                  isDisabled
                    ? 'cursor-not-allowed border-white/10 bg-white/[0.03] text-white/35'
                    : 'border-white/12 bg-white/[0.04] text-white hover:border-[#ffd54f]/35 hover:bg-[#ffd54f]/10'
                }`}
              >
                <Motion.div
                  whileHover={!isDisabled ? { rotate: 6 } : undefined}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-current/40 sm:h-11 sm:w-11"
                >
                  <Icon size={15} className="sm:h-4 sm:w-4" />
                </Motion.div>
                <div className="mt-2 text-[8px] font-black uppercase leading-tight tracking-[0.12em] sm:text-[9px] sm:tracking-[0.14em]">
                  {button.label}
                </div>
              </Motion.button>
            );
          })}
        </div>

        <Motion.button
          type="button"
          onClick={onSpin}
          disabled={!canSpin || isSpinning}
          whileHover={canSpin && !isSpinning ? { scale: 1.02 } : undefined}
          whileTap={canSpin && !isSpinning ? { scale: 0.98 } : undefined}
          animate={
            canSpin && !isSpinning
              ? {
                  boxShadow: [
                    '0 0 0 rgba(46,125,50,0.18)',
                    '0 0 28px rgba(46,125,50,0.34)',
                    '0 0 0 rgba(46,125,50,0.18)',
                  ],
                }
              : { boxShadow: '0 0 0 rgba(0,0,0,0)' }
          }
          transition={{ duration: 1.4, repeat: canSpin && !isSpinning ? Infinity : 0 }}
          className={`mt-3 flex w-full items-center justify-center gap-1.5 rounded-[20px] border px-2 py-3 text-[11px] font-black uppercase tracking-[0.16em] sm:mt-4 sm:gap-2 sm:rounded-[24px] sm:px-4 sm:py-4 sm:text-sm sm:tracking-[0.22em] ${
            canSpin && !isSpinning
              ? 'border-emerald-300/40 bg-[linear-gradient(180deg,#2E7D32_0%,#1B5E20_100%)] text-white'
              : 'cursor-not-allowed border-white/10 bg-white/[0.04] text-white/40'
          }`}
        >
          {isSpinning ? <CircleX size={16} /> : <Target size={16} />}
          {isSpinning ? 'Submitting' : 'Spin'}
        </Motion.button>
      </div>
    );
  }
);

RouletteControls.displayName = 'RouletteControls';

export default RouletteControls;
