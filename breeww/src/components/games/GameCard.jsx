import React from 'react';
import { motion as Motion } from 'framer-motion';
import { pageHref, navigateTo } from '../../lib/navigation';
import { useAudio } from '../../context/AudioContext';
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
  const { playChip } = useAudio();
  const normId = String(game.id).toLowerCase();
  const accent = game.accentColor || '#FFD700';
  const category = CATEGORY_MAP[normId] || game.category || 'LIVE';

  const defaultGradient = `linear-gradient(135deg, ${accent}33 0%, #1A0202 100%)`;

  const handleClick = (e) => {
    e.preventDefault();
    playChip();
    navigateTo(game.path);
  };

  return (
    <Motion.a
      href={pageHref(game.path)}
      onClick={handleClick}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="group relative flex flex-col rounded-2xl overflow-hidden border border-amber-500/30 bg-[#1E0303]/95 shadow-xl hover:border-amber-400 hover:shadow-[0_8px_25px_rgba(255,215,0,0.25)] transition-all duration-200 cursor-pointer"
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
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/70 border border-emerald-500/50 text-emerald-400 text-[9px] font-black uppercase tracking-wider backdrop-blur-md shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" style={{ animationDuration: '2s' }} />
            Live
          </span>

          <span className="px-2 py-0.5 rounded-full bg-black/70 border border-amber-500/30 text-amber-300 text-[8px] font-black uppercase tracking-wider backdrop-blur-md">
            {category}
          </span>
        </div>
      </div>

      {/* Card Info Footer */}
      <div className="p-3 bg-[#120101] flex items-center justify-between gap-2 border-t border-amber-500/20">
        <div className="min-w-0">
          <p className="text-[9px] font-black uppercase tracking-widest text-amber-400/60 truncate">
            {category}
          </p>
          <h3 className="text-xs sm:text-sm font-black text-white truncate leading-tight mt-0.5 group-hover:text-amber-300 transition-colors">
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
