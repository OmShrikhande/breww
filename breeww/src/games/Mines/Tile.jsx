import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Tile = ({ status, index, onClick, disabled }) => (
  <motion.button
    type="button"
    whileHover={!disabled && status === 'hidden' ? { scale: 1.04 } : {}}
    whileTap={!disabled && status === 'hidden' ? { scale: 0.94 } : {}}
    onClick={() => onClick(index)}
    disabled={disabled || status !== 'hidden'}
    className={`relative aspect-square rounded-xl border-2 transition-all duration-200 flex items-center justify-center text-2xl shadow-md
      ${status === 'hidden' ? 'bg-gradient-to-br from-slate-700 to-slate-900 border-slate-500/40 hover:border-casino-accent/60 hover:shadow-glow' : ''}
      ${status === 'safe' ? 'bg-gradient-to-br from-emerald-600 to-emerald-800 border-emerald-400/50' : ''}
      ${status === 'mine' ? 'bg-gradient-to-br from-red-600 to-red-900 border-red-400 animate-pulse' : ''}
      ${status === 'mine-revealed' ? 'bg-gradient-to-br from-red-950 to-slate-900 border-red-900/50 opacity-70' : ''}
    `}
  >
    <AnimatePresence mode="wait">
      {status === 'hidden' && (
        <motion.span key="dot" className="w-2.5 h-2.5 rounded-full bg-white/20" />
      )}
      {status === 'safe' && (
        <motion.span key="gem" initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-lg">
          💎
        </motion.span>
      )}
      {(status === 'mine' || status === 'mine-revealed') && (
        <motion.span key="bomb" initial={{ scale: 0 }} animate={{ scale: 1 }}>
          💣
        </motion.span>
      )}
    </AnimatePresence>
  </motion.button>
);

export default Tile;
