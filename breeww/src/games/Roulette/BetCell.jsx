import React from 'react';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import Chip from './Chip';

const BetCell = React.memo(
  ({
    label,
    tone = 'black',
    onClick,
    chips = [],
    amount = 0,
    isWinning = false,
    isDisabled = false,
    className = '',
    textClassName = '',
    labelClassName = '',
    children,
    title,
    style,
  }) => {
    const toneClasses = {
      red: 'bg-[linear-gradient(180deg,#C62828_0%,#9D1C1C_100%)] text-white',
      black: 'bg-[linear-gradient(180deg,#1f1f1f_0%,#121212_100%)] text-white',
      green: 'bg-[linear-gradient(180deg,#2E7D32_0%,#1B5E20_100%)] text-white',
      slate: 'bg-[linear-gradient(180deg,#363636_0%,#222222_100%)] text-white',
      clear: 'bg-transparent text-white',
    };

    return (
      <Motion.button
        type="button"
        onClick={onClick}
        disabled={isDisabled}
        whileHover={!isDisabled ? { scale: 1.02, y: -1 } : undefined}
        whileTap={!isDisabled ? { scale: 0.98 } : undefined}
        animate={
          isWinning
            ? {
                boxShadow: [
                  '0 0 0 rgba(255,215,0,0)',
                  '0 0 28px rgba(255,215,0,0.45)',
                  '0 0 0 rgba(255,215,0,0)',
                ],
                scale: [1, 1.03, 1],
              }
            : { boxShadow: '0 0 0 rgba(0,0,0,0)', scale: 1 }
        }
        transition={{ duration: 0.8, ease: 'easeInOut', repeat: isWinning ? Infinity : 0 }}
        className={`relative overflow-hidden border border-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition-colors ${toneClasses[tone] ?? toneClasses.black} ${className} ${
          isDisabled ? 'cursor-not-allowed opacity-70' : ''
        }`}
        title={title}
        style={style}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.16),transparent_54%)]" />
        {isWinning && <div className="absolute inset-0 border-2 border-[#ffd54f]" />}
        {children ? (
          children
        ) : (
          <div className={`relative flex h-full items-center justify-center px-2 text-center font-black ${labelClassName}`}>
            <span className={textClassName}>{label}</span>
          </div>
        )}

        <AnimatePresence>
          {chips.length > 0 && (
            <Motion.div
              layout
              className="pointer-events-none absolute inset-0 flex items-start justify-start p-1.5"
            >
              <div className="relative">
                {chips.map((chipValue, index) => (
                  <div
                    key={`${chipValue}-${index}`}
                    className="absolute left-0 top-0"
                    style={{ transform: `translate(${index * 4}px, ${index * 2}px)` }}
                  >
                    <Chip value={chipValue} size="sm" stackIndex={index} compact />
                  </div>
                ))}
              </div>
            </Motion.div>
          )}
        </AnimatePresence>

        {amount > 0 && (
          <div className="pointer-events-none absolute bottom-1 right-1 rounded-full bg-black/45 px-2 py-0.5 text-[9px] font-black text-white/90 shadow-lg">
            ₹{amount}
          </div>
        )}
      </Motion.button>
    );
  }
);

BetCell.displayName = 'BetCell';

export default BetCell;
