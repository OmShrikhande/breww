import React from 'react';
import { navigateTo } from '../../lib/navigation';

const Banner = () => {
  return (
    <div
      onClick={() => navigateTo('/wallet')}
      role="button"
      tabIndex={0}
      className="relative w-full aspect-[2/1] overflow-hidden mb-4 shadow-xl border border-white/5 cursor-pointer group active:scale-[0.99] transition-transform"
    >
      <div className="w-full h-full bg-gradient-to-r from-[#1B233D] via-[#2A3B6E] to-[#1B233D] flex items-center justify-center relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/20 via-transparent to-black/60" />
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-6">
        <div className="flex flex-col gap-1">
          <span className="text-2xl sm:text-4xl font-black text-[#FFD700] uppercase italic tracking-tighter leading-tight drop-shadow-md group-hover:scale-105 transition-transform origin-left">
            FIRST DEPOSIT
          </span>
          <div className="flex items-center gap-2">
            <span className="text-white font-bold text-sm sm:text-lg">UP TO</span>
            <span className="bg-[#FFD700] text-[#1B233D] px-2.5 py-0.5 rounded-lg text-lg sm:text-2xl font-black shadow-lg">
              ₹ 10,000
            </span>
            <span className="text-white font-bold text-sm sm:text-lg uppercase tracking-wider">BONUS</span>
          </div>
          <span className="text-[11px] text-emerald-400 font-bold mt-1 flex items-center gap-1">
            Tap to claim deposit bonus →
          </span>
        </div>
      </div>
    </div>
  );
};

export default Banner;
