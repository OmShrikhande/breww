import React from 'react';

const Banner = () => {
  return (
    <div className="relative w-full aspect-[2/1] overflow-hidden mb-4 shadow-xl border border-white/5">
      <img 
        src="https://placehold.co/800x400/1B233D/ffffff?text=FIRST+DEPOSIT+UP+TO+₹10,000+BONUS" 
        alt="Banner" 
        className="w-full h-full object-cover" 
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent flex flex-col justify-end p-6">
        <div className="flex flex-col gap-1">
          <span className="text-2xl sm:text-4xl font-black text-[#FFD700] uppercase italic tracking-tighter leading-tight drop-shadow-md">
            FIRST DEPOSIT
          </span>
          <div className="flex items-center gap-2">
            <span className="text-white font-bold text-sm sm:text-lg">UP TO</span>
            <span className="bg-[#FFD700] text-[#1B233D] px-2 py-0.5 rounded text-lg sm:text-2xl font-black">
              ₹ 10,000
            </span>
            <span className="text-white font-bold text-sm sm:text-lg uppercase">BONUS</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;
