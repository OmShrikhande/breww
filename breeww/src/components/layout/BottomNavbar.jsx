import React from 'react';
import { Home, Activity, CircleDollarSign, User } from 'lucide-react';
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
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-[#1B233D] border-t border-white/5 pb-safe z-50">
      <div className="flex justify-around items-end h-16 pb-1">
        {navItems.map((item, idx) => (
          <a
            key={item.path || idx}
            href={pageHref(item.path)}
            onClick={(e) => {
              e.preventDefault();
              navigateTo(item.path);
            }}
            className={
              `flex flex-col items-center justify-center transition-colors ${
                item.isCenter ? 'relative -top-4 scale-110' : ''
              } ${
                isCurrentPath(item.path) ? 'text-[#FFD700]' : 'text-[#8C9AB5]'
              }`
            }
          >
            {item.isCenter ? (
              <div className="flex flex-col items-center">
                <div className="relative w-16 h-16 mb-[-8px]">
                  {/* Spin Wheel Graphic */}
                  <div className="absolute inset-0 bg-gradient-to-b from-[#FFA500] to-[#FF4500] rounded-full border-4 border-[#FFD700] shadow-[0_0_15px_rgba(255,215,0,0.5)] flex items-center justify-center overflow-hidden">
                    <div className="w-full h-full relative animate-spin-slow">
                      {[...Array(8)].map((_, i) => (
                        <div 
                          key={i} 
                          className="absolute top-0 left-1/2 w-0.5 h-1/2 bg-[#FFD700]/30 origin-bottom"
                          style={{ transform: `rotate(${i * 45}deg) translateX(-50%)` }}
                        ></div>
                      ))}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-[#2D4594] text-white text-[8px] font-black rounded-full w-6 h-6 flex items-center justify-center border border-white shadow-md">
                        GO
                      </div>
                    </div>
                  </div>
                  {/* Pointer */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-[#FFD700]"></div>
                </div>
                <div className="bg-[#1B233D] px-2 py-0.5 rounded-sm border border-white/10 shadow-lg">
                  <span className="text-[#5D87E6] text-[10px] font-black whitespace-nowrap">
                    Get ₹500
                  </span>
                </div>
              </div>
            ) : (
              <>
                <item.icon size={22} />
                <span className="text-[10px] mt-0.5 font-bold">
                  {item.label}
                </span>
              </>
            )}
          </a>
        ))}
      </div>
    </nav>
  );
};

export default BottomNavbar;
