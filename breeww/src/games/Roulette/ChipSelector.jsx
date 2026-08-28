import React from 'react';
import { motion as Motion } from 'framer-motion';
import Chip from './Chip';

const ChipSelector = React.memo(({ chipValues, selectedChip, onSelectChip }) => {
  return (
    <Motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="rounded-[22px] border border-white/10 bg-white/[0.03] p-3 backdrop-blur-md sm:rounded-[24px]"
    >
      <div className="text-[10px] font-black uppercase tracking-[0.28em] text-[#d8bb82]/75">Chip Selector</div>
      <div className="mt-3 flex flex-nowrap gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:gap-3 sm:overflow-visible sm:pb-0">
        {chipValues.map((value) => {
          const isActive = selectedChip === value;
          return (
            <Motion.button
              key={value}
              type="button"
              onClick={() => onSelectChip(value)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.96 }}
              className={`rounded-full border p-1 transition-all ${
                isActive
                  ? 'border-[#ffd54f]/70 bg-[#ffd54f]/10 shadow-[0_0_28px_rgba(255,213,79,0.28)]'
                  : 'border-white/10 bg-white/[0.02]'
              }`}
            >
              <Chip value={value} size="md" />
            </Motion.button>
          );
        })}
      </div>
    </Motion.div>
  );
});

ChipSelector.displayName = 'ChipSelector';

export default ChipSelector;
