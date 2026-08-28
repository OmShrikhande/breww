import React, { useState } from 'react';
import { ChevronLeft, HelpCircle, FileText } from 'lucide-react';
import { goBackOr } from '../lib/navigation';

const InviteWheel = () => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);

  const handleSpin = () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    // Add multiple full rotations (5 full circles) plus a random extra bit
    const newRotation = rotation + 1800 + Math.floor(Math.random() * 360);
    setRotation(newRotation);
    
    setTimeout(() => {
      setIsSpinning(false);
    }, 4000); // Animation duration matches duration-4000ms
  };

  return (
    <div className="min-h-screen bg-[#8c919e] flex justify-center">
      <div className="w-full max-w-md bg-gradient-to-b from-[#FF5C38] via-[#FF3B30] to-[#E60000] text-white relative shadow-2xl border-x border-white/5 flex flex-col min-h-screen">
        {/* Header */}
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md h-12 bg-[#2D4594] flex items-center justify-between px-4 z-[110]">
          <button onClick={() => goBackOr('/')}>
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-bold uppercase tracking-tight">Invite Wheel</h1>
          <div className="flex gap-3">
            <HelpCircle size={20} />
            <FileText size={20} />
          </div>
        </div>

        <main className="flex-1 pt-12 overflow-y-auto custom-scrollbar flex flex-col items-center">
          {/* Amount Info */}
          <div className="mt-8 flex flex-col items-center shrink-0">
            <span className="text-[10px] opacity-80 uppercase tracking-wider font-bold">my amount(71:57:05)</span>
            <h2 className="text-4xl font-black mt-1">₹475.60</h2>
            
            <button className="mt-4 bg-[#FFC526] text-[#E60000] px-10 py-1.5 rounded-full font-black text-sm shadow-lg border-2 border-white/30 uppercase">
              Cash Out
            </button>
          </div>

          {/* Wheel Section */}
          <div className="relative mt-12 w-80 h-80 flex items-center justify-center shrink-0">
            {/* Background coins and glow */}
            <div className="absolute inset-0 bg-[#FFD700]/20 blur-[60px] rounded-full"></div>
            
            {/* The Wheel */}
            <div 
              className="relative w-full h-full rounded-full border-[10px] border-[#FFD700] shadow-[0_0_30px_rgba(255,215,0,0.4)] overflow-hidden transition-transform duration-[4000ms] ease-out"
              style={{ transform: `rotate(${rotation}deg)` }}
            >
              <div className="absolute inset-0 bg-white rounded-full">
                {[...Array(8)].map((_, i) => (
                  <div 
                    key={i} 
                    className="absolute top-0 left-1/2 w-[2px] h-1/2 bg-[#FFD700] origin-bottom"
                    style={{ transform: `rotate(${i * 45}deg) translateX(-50%)` }}
                  ></div>
                ))}
                
                {/* Prizes */}
                <div className="absolute top-[15%] left-1/2 -translate-x-1/2 text-[#E60000] font-black text-xs">₹500</div>
                <div className="absolute top-[25%] right-[15%] text-[#E60000] font-black text-xs rotate-[45deg]">₹80</div>
                <div className="absolute top-[50%] right-[5%] -translate-y-1/2 text-[#E60000] font-black text-xs rotate-[90deg]">₹20</div>
                <div className="absolute bottom-[25%] right-[15%] text-[#E60000] font-black text-xs rotate-[135deg]">₹30</div>
                <div className="absolute bottom-[15%] left-1/2 -translate-x-1/2 text-[#E60000] font-black text-xs rotate-[180deg]">₹50</div>
                <div className="absolute bottom-[25%] left-[15%] text-[#E60000] font-black text-xs rotate-[225deg]">₹0-10</div>
                <div className="absolute top-[50%] left-[5%] -translate-y-1/2 text-[#E60000] font-black text-xs rotate-[270deg]">₹5</div>
                <div className="absolute top-[25%] left-[15%] text-[#E60000] font-black text-xs rotate-[315deg]">₹10</div>
              </div>
            </div>

            {/* Center Button - Outside the rotating part to stay fixed */}
            <button 
              onClick={handleSpin}
              disabled={isSpinning}
              className="absolute inset-0 m-auto w-20 h-20 bg-gradient-to-b from-[#FF5C38] to-[#E60000] rounded-full border-4 border-[#FFD700] shadow-xl flex flex-col items-center justify-center z-10 active:scale-95 transition-transform disabled:opacity-80"
            >
              <span className="text-xl font-black italic">X1</span>
              <span className="text-[8px] font-bold uppercase tracking-tighter">Free Spin</span>
            </button>
            
            {/* Wheel Base */}
            <div className="absolute -bottom-8 w-40 h-16 bg-[#B30000] rounded-t-3xl border-t-4 border-[#FFD700]/30 shadow-2xl flex items-center justify-center">
              <div className="w-32 h-10 bg-[#800000] rounded-t-2xl"></div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-20 flex flex-col items-center w-full px-8 pb-10 shrink-0 relative">
            <button className="w-full bg-gradient-to-b from-[#FFD700] to-[#FF8C00] text-[#E60000] py-3.5 rounded-full font-black text-sm shadow-[0_4px_10px_rgba(0,0,0,0.3)] uppercase border-2 border-white/50 z-10">
              Invite Friends to Get Spin
            </button>
            <div className="mt-4 flex items-center justify-center w-full relative">
              <p className="text-[11px] font-bold opacity-95 text-white/90 z-10">Only ₹24.40 left to get prize ₹500.00</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default InviteWheel;
