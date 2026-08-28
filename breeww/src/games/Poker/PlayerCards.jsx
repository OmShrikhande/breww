import React from 'react';

const suitStyles = {
  hearts: { symbol: '♥', color: 'text-rose-500' },
  diamonds: { symbol: '♦', color: 'text-rose-500' },
  clubs: { symbol: '♣', color: 'text-slate-900' },
  spades: { symbol: '♠', color: 'text-slate-900' },
};

const CardFace = ({ card, compact }) => {
  if (!card || !card.rank || !card.suit) {
    return (
      <div className={`relative overflow-hidden rounded-[14px] border border-white/15 bg-gradient-to-br from-slate-800 via-slate-900 to-black shadow-[0_12px_24px_rgba(0,0,0,0.35)] ${compact ? 'h-14 w-10' : 'h-20 w-14 sm:h-24 sm:w-16'}`}>
        <div className="absolute inset-1 rounded-[12px] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(234,179,8,0.18),_transparent_55%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_0%,rgba(255,255,255,0.08)_48%,transparent_100%)]" />
      </div>
    );
  }

  const suit = suitStyles[card.suit] || suitStyles.spades;

  return (
    <div className={`relative overflow-hidden rounded-[14px] border border-white/40 bg-[linear-gradient(180deg,#fffef8_0%,#f8f5ea_100%)] text-slate-950 shadow-[0_14px_30px_rgba(15,23,42,0.35)] ${compact ? 'h-14 w-10' : 'h-20 w-14 sm:h-24 sm:w-16'}`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.16),_transparent_42%)]" />
      <div className={`relative flex h-full flex-col justify-between p-1.5 ${compact ? 'text-[10px]' : 'text-xs'}`}>
        <div className={`flex flex-col leading-none ${suit.color}`}>
          <span className={`font-black ${compact ? 'text-xs' : 'text-sm'}`}>{card.rank}</span>
          <span className={compact ? 'text-[9px]' : 'text-xs'}>{suit.symbol}</span>
        </div>
        <div className={`self-center font-black ${suit.color} ${compact ? 'text-lg' : 'text-2xl'}`}>
          {suit.symbol}
        </div>
        <div className={`flex rotate-180 flex-col self-end leading-none ${suit.color}`}>
          <span className={`font-black ${compact ? 'text-xs' : 'text-sm'}`}>{card.rank}</span>
          <span className={compact ? 'text-[9px]' : 'text-xs'}>{suit.symbol}</span>
        </div>
      </div>
    </div>
  );
};

const PlayerCards = ({ cards = [], compact = false, overlap = true }) => {
  return (
    <div className={`flex ${overlap ? '-space-x-3' : 'gap-2'} ${compact ? 'scale-95' : ''}`}>
      {cards.map((card, index) => (
        <div
          key={`${card?.rank || 'hidden'}-${card?.suit || index}`}
          className={index === 1 && overlap ? 'translate-y-1' : ''}
        >
          <CardFace card={card} compact={compact} />
        </div>
      ))}
    </div>
  );
};

export default PlayerCards;
