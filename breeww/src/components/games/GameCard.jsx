import React from 'react';
import { motion as Motion } from 'framer-motion';
import { pageHref } from '../../lib/navigation';
import GamePreview from './GamePreview';

const CATEGORY_MAP = {
  'andar-bahar': 'CARD',
  aviator: 'CRASH',
  colour: 'PREDICTION',
  'color-prediction': 'PREDICTION',
  mines: 'SKILL',
  wheel: 'FORTUNE',
  'spin-wheel': 'FORTUNE',
  dice: 'DICE',
  'dragon-tiger': 'CARD',
  plinko: 'ARCADE',
  roulette: 'CASINO',
  poker: 'CARDS',
  'chamber-risk': 'ORIGINALS',
};

const GameCard = ({ game }) => {
  const normId = String(game.id).toLowerCase();
  const accent = game.accentColor || '#6366f1';
  const category = CATEGORY_MAP[normId] || game.category || 'LIVE';

  const defaultGradient = `linear-gradient(135deg, ${accent}22 0%, #0d1530 100%)`;

  return (
    <Motion.a
      href={pageHref(game.path)}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="group relative flex flex-col rounded-2xl overflow-hidden border border-white/10 bg-[#121936]/90 shadow-xl hover:border-white/25 hover:shadow-[0_8px_24px_rgba(0,0,0,0.5)] transition-colors duration-200"
      style={{ '--accent': accent }}
    >
      {/* Top Preview Area with Live Simulation */}
      <div
        className="relative h-36 w-full overflow-hidden flex-shrink-0"
        style={{ background: game.gradient || defaultGradient }}
      >
        <GamePreview gameId={game.id} accentColor={accent} />

        {/* Top Overlay Badges */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none z-10">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-[9px] font-black uppercase tracking-wider backdrop-blur-md shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" style={{ animationDuration: '2s' }} />
            Live
          </span>

          <span className="px-2 py-0.5 rounded-full bg-black/60 border border-white/15 text-white/90 text-[8px] font-black uppercase tracking-wider backdrop-blur-md">
            {category}
          </span>
        </div>
      </div>

      {/* Card Info Footer */}
      <div className="p-3 bg-[#0c1228] flex items-center justify-between gap-2 border-t border-white/5">
        <div className="min-w-0">
          <p className="text-[9px] font-black uppercase tracking-widest text-white/40 truncate">
            {category}
          </p>
          <h3 className="text-xs sm:text-sm font-black text-white truncate leading-tight mt-0.5 group-hover:text-amber-400 transition-colors">
            {game.name}
          </h3>
        </div>
        <div className="text-xl flex-shrink-0 opacity-90 drop-shadow-md group-hover:scale-110 transition-transform">
          {game.icon || '🎮'}
        </div>
      </div>
    </Motion.a>
  );
};

export default GameCard;
