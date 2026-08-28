import React from 'react';
import PlayerCards from './PlayerCards';

const CommunityCards = ({ cards = [] }) => {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="text-center">
        <div className="text-[10px] font-black uppercase tracking-[0.38em] text-emerald-100/70">Community Cards</div>
        <div className="mt-1 text-xs font-semibold text-emerald-50/60">Flop, turn and river land here</div>
      </div>
      <div className="rounded-[28px] border border-white/10 bg-black/20 px-3 py-3 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:px-4">
        <div className="flex gap-2 sm:gap-3">
          {cards.map((card, index) => (
            <PlayerCards
              key={`${card?.rank || 'hidden'}-${card?.suit || index}`}
              cards={[card]}
              overlap={false}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommunityCards;
