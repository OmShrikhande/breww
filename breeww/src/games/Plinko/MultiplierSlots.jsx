import React from 'react';
import { motion } from 'framer-motion';

const MultiplierSlots = ({ multipliers, slotWidth, activeSlotIndex }) => {
  return (
    <div className="flex justify-center gap-1 mt-4">
      {multipliers.map((multiplier, index) => (
        <motion.div
          key={index}
          className={`flex items-center justify-center h-10 rounded-lg text-[10px] font-black shadow-lg transition-all
            ${index === activeSlotIndex ? 'scale-110 shadow-pink-600/50' : ''}
            ${multiplier >= 2 ? 'bg-pink-600 text-white' : 'bg-[#242E4D] text-gray-400'}
          `}
          style={{ width: `${slotWidth}px` }}
          animate={{
            scale: index === activeSlotIndex ? 1.2 : 1,
            backgroundColor: index === activeSlotIndex ? '#db2777' : multiplier >= 2 ? '#db2777' : '#242E4D',
          }}
        >
          {multiplier}x
        </motion.div>
      ))}
    </div>
  );
};

export default MultiplierSlots;
