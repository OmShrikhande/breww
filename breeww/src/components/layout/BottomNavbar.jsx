import React from 'react';
import { Home, Activity, CircleDollarSign, User, Sparkles } from 'lucide-react';
import { isCurrentPath, pageHref, navigateTo } from '../../lib/navigation';

const BottomNavbar = () => {
  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Activity, label: 'Activity', path: '/activity' },
    { label: 'Get ₹500', path: '/invite-wheel', isCenter: true },
    { icon: CircleDollarSign, label: 'Promotion', path: '/promotion' },
    { icon: User, label: 'Account', path: '/account' },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-[#140202]/95 backdrop-blur-md border-t border-amber-500/30 pb-safe z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.7)]">
      <div className="flex justify-around items-end h-16 pb-1.5 px-1">
        {navItems.map((item, idx) => {
          const active = isCurrentPath(item.path);

          return (
            <a
              key={item.path || idx}
              href={pageHref(item.path)}
              onClick={(e) => {
                e.preventDefault();
                navigateTo(item.path);
              }}
              className={
                `flex flex-col items-center justify-center transition-all ${
                  item.isCenter ? 'relative -top-3.5 scale-105' : 'flex-1'
                } ${
                  active ? 'text-amber-400 font-black' : 'text-white/50 hover:text-white/80'
                }`
              }
            >
              {item.isCenter ? (
                <div className="flex flex-col items-center group">
                  <div className="relative w-16 h-16 mb-[-10px]">
                    {/* Glowing Outer Halo */}
                    <div className="absolute inset-0 bg-amber-500/30 rounded-full blur-md animate-pulse" />
                    
                    {/* Spin Wheel Graphic Chassis */}
                    <div className="relative w-full h-full bg-gradient-to-b from-[#FFE57F] via-[#D4AF37] to-[#8C6D1F] rounded-full border-2 border-white/80 shadow-[0_0_20px_rgba(255,215,0,0.5)] flex items-center justify-center p-1 overflow-hidden group-hover:scale-105 transition-transform">
                      <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#990000] via-[#D80000] to-[#FF4500] relative animate-spin-slow flex items-center justify-center overflow-hidden">
                        {[...Array(8)].map((_, i) => (
                          <div 
                            key={i} 
                            className="absolute top-0 left-1/2 w-0.5 h-1/2 bg-[#FFE57F]/50 origin-bottom"
                            style={{ transform: `rotate(${i * 45}deg) translateX(-50%)` }}
                          />
                        ))}
                      </div>
                      
                      {/* Center Hub */}
                      <div className="absolute inset-0 m-auto w-6 h-6 rounded-full bg-gradient-to-b from-[#FFE57F] to-[#E6B800] border border-white flex items-center justify-center shadow-md">
                        <span className="text-[8px] font-black text-red-950 uppercase tracking-tighter">
                          WIN
                        </span>
                      </div>
                    </div>

                    {/* Top Pointer */}
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[7px] border-t-amber-300 drop-shadow" />
                  </div>

                  {/* Badge */}
                  <div className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 px-2.5 py-0.5 rounded-full border border-white/80 shadow-md">
                    <span className="text-red-950 text-[10px] font-black whitespace-nowrap uppercase tracking-tight flex items-center gap-0.5">
                      <Sparkles size={9} /> Get ₹500
                    </span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <item.icon size={21} className={active ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(255,215,0,0.6)]' : ''} />
                    {active && (
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-amber-400 rounded-full shadow-[0_0_4px_rgba(255,215,0,0.8)]" />
                    )}
                  </div>
                  <span className={`text-[10px] mt-0.5 tracking-tight ${active ? 'text-amber-300 font-black' : 'font-semibold'}`}>
                    {item.label}
                  </span>
                </>
              )}
            </a>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavbar;
