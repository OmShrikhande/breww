import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2 } from 'lucide-react';

const Tile = ({ status, index, onClick, disabled }) => {
  const isHidden = status === 'hidden';
  const isRevealing = status === 'revealing';
  const isSafe = status === 'safe';
  const isMineHit = status === 'mine';
  const isMineRevealed = status === 'mine-revealed';
  const isGemRevealed = status === 'gem-revealed';

  return (
    <motion.button
      type="button"
      whileHover={!disabled && isHidden ? { scale: 1.05, y: -2 } : {}}
      whileTap={!disabled && isHidden ? { scale: 0.92 } : {}}
      onClick={() => onClick(index)}
      disabled={disabled || (!isHidden && !isRevealing)}
      className={`relative aspect-square rounded-2xl border-2 transition-all duration-200 flex items-center justify-center text-2xl sm:text-3xl shadow-lg select-none cursor-pointer overflow-hidden ${
        isHidden
          ? 'bg-gradient-to-b from-[#1e293b] to-[#0f172a] border-slate-600/50 hover:border-amber-400/80 hover:shadow-[0_0_15px_rgba(245,158,11,0.3)] active:border-amber-400'
          : ''
      } ${
        isRevealing
          ? 'bg-gradient-to-br from-emerald-600/60 to-slate-900 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.6)] animate-pulse'
          : ''
      } ${
        isSafe
          ? 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-800 border-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.5)] ring-2 ring-emerald-400/50'
          : ''
      } ${
        isMineHit
          ? 'bg-gradient-to-br from-red-600 via-rose-700 to-red-950 border-red-400 shadow-[0_0_25px_rgba(239,68,68,0.7)] animate-bounce ring-4 ring-red-500'
          : ''
      } ${
        isMineRevealed
          ? 'bg-gradient-to-br from-red-950/80 to-slate-900 border-red-900/60 opacity-60'
          : ''
      } ${
        isGemRevealed
          ? 'bg-gradient-to-br from-emerald-950/60 to-slate-900 border-emerald-900/50 opacity-50'
          : ''
      } ${disabled && isHidden ? 'opacity-70 cursor-not-allowed' : ''}`}
    >
      <AnimatePresence mode="wait">
        {isHidden && (
          <motion.div
            key="hidden-dot"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="w-3 h-3 rounded-full bg-slate-500/40 border border-white/10 shadow-inner"
          />
        )}

        {isRevealing && (
          <motion.div
            key="revealing-spinner"
            initial={{ scale: 0.5, rotate: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
            className="flex items-center justify-center text-emerald-400"
          >
            <Sparkles size={20} className="animate-spin" />
          </motion.div>
        )}

        {isSafe && (
          <motion.div
            key="gem"
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: [0, 1.25, 1], rotate: 0 }}
            transition={{ duration: 0.3, type: 'spring', stiffness: 400, damping: 20 }}
            className="flex items-center justify-center drop-shadow-[0_2px_12px_rgba(255,255,255,0.7)]"
          >
            💎
          </motion.div>
        )}

        {isMineHit && (
          <motion.div
            key="hit-bomb"
            initial={{ scale: 0, rotate: 180 }}
            animate={{ scale: [0, 1.3, 1], rotate: 0 }}
            transition={{ duration: 0.35, type: 'spring' }}
            className="flex items-center justify-center drop-shadow-[0_2px_12px_rgba(239,68,68,0.8)] text-3xl"
          >
            💥
          </motion.div>
        )}

        {isMineRevealed && (
          <motion.div
            key="revealed-bomb"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 0.75, scale: 1 }}
            className="flex items-center justify-center text-xl opacity-75 grayscale-[30%]"
          >
            💣
          </motion.div>
        )}

        {isGemRevealed && (
          <motion.div
            key="revealed-gem"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 0.6, scale: 1 }}
            className="flex items-center justify-center text-lg opacity-50"
          >
            💎
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

export default Tile;
