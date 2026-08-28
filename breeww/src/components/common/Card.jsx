import React from 'react';
import { Play } from 'lucide-react';
import { motion as Motion } from 'framer-motion';
import { pageHref } from '../../lib/navigation';

const GameCard = ({ game }) => {
  return (
    <a 
      href={pageHref(game.path)} 
      className="group relative bg-[#141A3C] rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_15px_30px_rgba(99,102,241,0.4)] focus:outline-none"
    >
      <div className="aspect-[3/4] overflow-hidden relative">
        <img 
          src={game.image} 
          alt={game.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Animated Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F2A] via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity"></div>
        
        {/* Floating Coins on Card (Randomized for variety) */}
        <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          {[...Array(3)].map((_, i) => (
            <Motion.span
              key={i}
              animate={{ 
                y: [0, -40],
                x: [0, (i - 1) * 20],
                opacity: [0, 1, 0],
                scale: [0.5, 1, 0.5]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                delay: i * 0.4
              }}
              className="absolute text-lg bottom-10 left-1/2 -translate-x-1/2 z-20"
            >
              🪙
            </Motion.span>
          ))}
        </div>

        {/* Category Badge - Premium Style */}
        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/10 shadow-lg">
          <span className="text-[9px] font-black text-white uppercase tracking-widest">{game.category}</span>
        </div>

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100">
          <div className="bg-casino-accent p-3 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.8)]">
            <Play fill="white" size={24} className="ml-0.5" />
          </div>
        </div>
      </div>
      
      <div className="p-3 bg-casino-card">
        <h3 className="text-sm font-bold truncate group-hover:text-casino-accent transition-colors tracking-tight">{game.name}</h3>
        <div className="flex items-center gap-1 mt-1">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-[10px] text-gray-500 font-medium">Live Now</span>
        </div>
      </div>
    </a>
  );
};

export default GameCard;
