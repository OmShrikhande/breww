import React from 'react';
import { Rocket, Sparkles, Gem, Crown, LayoutGrid } from 'lucide-react';
import { useAudio } from '../../context/AudioContext';

const CATEGORIES = [
  { id: 'all', label: 'All Games', icon: LayoutGrid },
  { id: 'crash', label: 'Crash / Aviator', icon: Rocket, color: 'text-red-400' },
  { id: 'lottery', label: 'Color Prediction', icon: Sparkles, color: 'text-emerald-400' },
  { id: 'originals', label: 'Mines & Dice', icon: Gem, color: 'text-amber-400' },
  { id: 'cards', label: 'Live Casino', icon: Crown, color: 'text-purple-400' },
];

const GameCategoryGrid = ({ activeCategory = 'all', onSelectCategory }) => {
  const { playChip } = useAudio();

  return (
    <div className="px-4 mb-4 select-none">
      <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                playChip();
                if (onSelectCategory) onSelectCategory(cat.id);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all active:scale-95 cursor-pointer shrink-0 border ${
                isActive
                  ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-red-950 border-white/80 shadow-[0_0_12px_rgba(255,215,0,0.5)] font-black'
                  : 'bg-[#200202]/90 text-white/70 hover:text-white hover:bg-[#2A0404] border-amber-500/20'
              }`}
            >
              <cat.icon size={14} className={isActive ? 'text-red-950' : cat.color || 'text-amber-400'} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default GameCategoryGrid;
