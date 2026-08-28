import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Tile = ({ status, index, onClick, disabled }) => {
  // status: 'hidden', 'safe', 'mine', 'mine-revealed'

  const variants = {
    hidden: { scale: 1, rotateY: 0 },
    revealed: { scale: [1, 1.1, 1], rotateY: 180, transition: { duration: 0.4 } },
    explode: { 
      scale: [1, 1.2, 1], 
      backgroundColor: ['#141A3C', '#ef4444', '#141A3C'],
      transition: { duration: 0.5 } 
    }
  };

  return (
    <motion.button
      whileHover={!disabled && status === 'hidden' ? { scale: 1.03 } : {}}
      whileTap={!disabled && status === 'hidden' ? { scale: 0.96 } : {}}
      onClick={() => onClick(index)}
      disabled={disabled || status !== 'hidden'}
      className={`relative aspect-square rounded-xl shadow-lg border transition-all duration-300 flex items-center justify-center text-4xl
        ${status === 'hidden' ? 'bg-[#1a3a90] border-[#2f5fc1] hover:border-[#7ea4ff]' : ''}
        ${status === 'safe' ? 'bg-[#1c5bba] border-[#7bb5ff]' : ''}
        ${status === 'mine' ? 'bg-[#c92f2f] border-[#ff6f6f]' : ''}
        ${status === 'mine-revealed' ? 'bg-[#6f1c1c] border-[#9f4d4d]' : ''}
      `}
    >
      <AnimatePresence mode="wait">
        {status === 'hidden' && (
          <motion.div className="w-3 h-3 rounded-full bg-[#9db7ff]" />
        )}
        {status === 'safe' && (
          <motion.div
            key="safe"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-5 h-5 rounded-full bg-[#c2f7ff]"
          />
        )}
        {status === 'mine' && (
          <motion.div
            key="mine"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-red-200 text-2xl"
          >
            💣
          </motion.div>
        )}
        {status === 'mine-revealed' && (
          <motion.div
            key="mine-revealed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-300 text-2xl"
          >
            💣
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

export default Tile;
