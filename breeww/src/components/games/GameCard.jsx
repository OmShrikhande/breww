import React from 'react';
import { pageHref } from '../../lib/navigation';

const GameCard = ({ game }) => {
  const accent = game.accentColor || '#6366f1';

  return (
    <a
      href={pageHref(game.path)}
      className="group relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 shadow-lg active:scale-[0.97] transition-transform"
      style={{ background: game.gradient || `linear-gradient(145deg, ${accent}33, #0B0F2A)` }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
      <div className="absolute top-3 right-3 text-3xl drop-shadow-lg">{game.icon || '🎮'}</div>
      {game.roundDriven && (
        <span className="absolute top-3 left-3 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          Live
        </span>
      )}
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <p className="text-[10px] font-bold uppercase tracking-wider text-white/50 mb-0.5">{game.category}</p>
        <p className="text-sm font-black text-white leading-tight group-hover:text-sky-200 transition-colors">
          {game.name}
        </p>
      </div>
    </a>
  );
};

export default GameCard;
