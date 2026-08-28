import React from 'react';
import { motion as Motion } from 'framer-motion';

const chipThemes = {
  10: 'from-[#4caf50] to-[#2e7d32] border-[#c8e6c9] text-white',
  50: 'from-[#fbc02d] to-[#f57f17] border-[#fff1b8] text-[#1a1a1a]',
  100: 'from-[#ef5350] to-[#c62828] border-[#ffcdd2] text-white',
  500: 'from-[#7e57c2] to-[#4527a0] border-[#d1c4e9] text-white',
};

const Chip = React.memo(({ value, size = 'md', stackIndex = 0, compact = false }) => {
  const sizeClass =
    size === 'sm'
      ? 'h-7 w-7 text-[8px]'
      : size === 'lg'
        ? 'h-14 w-14 text-xs'
        : 'h-11 w-11 text-[10px]';

  return (
    <Motion.div
      layout
      initial={{ opacity: 0, scale: 0.3, y: -20 }}
      animate={{ opacity: 1, scale: 1, y: -stackIndex * 5 }}
      exit={{ opacity: 0, scale: 0.4, y: 10 }}
      transition={{ type: 'spring', stiffness: 340, damping: 22 }}
      className={`relative flex shrink-0 items-center justify-center rounded-full border-2 bg-gradient-to-br font-black shadow-[0_10px_20px_rgba(0,0,0,0.35)] ${chipThemes[value] ?? chipThemes[10]} ${sizeClass}`}
    >
      <div className="absolute inset-[3px] rounded-full border border-white/35" />
      <div className="absolute inset-[8px] rounded-full border border-dashed border-white/25" />
      <span className="relative tracking-tight">{compact ? value : `₹${value}`}</span>
    </Motion.div>
  );
});

Chip.displayName = 'Chip';

export default Chip;
