import React from 'react';
import { Volume2 } from 'lucide-react';
import { navigateTo } from '../../lib/navigation';

const Announcement = () => {
  return (
    <div
      onClick={() => navigateTo('/notifications')}
      className="flex items-center gap-2 bg-[#2D4594]/30 px-3 py-2 rounded-full mb-4 mx-4 cursor-pointer hover:bg-[#2D4594]/50 transition-colors border border-white/5 shadow-sm"
      role="button"
      tabIndex={0}
    >
      <Volume2 size={16} className="text-[#5D87E6] shrink-0" />
      <div className="flex-1 overflow-hidden">
        <div className="whitespace-nowrap animate-scroll text-[10px] text-white font-medium">
          Welcome to Breeww Games! Greetings, Gamers and Enthusiasts! Breeww is India's premier online gaming platform. Enjoy live games with fast withdrawals!
        </div>
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          navigateTo('/notifications');
        }}
        className="bg-[#5D87E6] hover:bg-[#4d75d6] active:scale-95 text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 shrink-0 transition-all cursor-pointer shadow-md"
      >
        <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
        Detail
      </button>
    </div>
  );
};

export default Announcement;
