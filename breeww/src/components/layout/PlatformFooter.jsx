import React from 'react';
import { Globe, Megaphone, Headset, BookOpen, Info, ChevronRight, Phone } from 'lucide-react';

const PlatformFooter = () => {
  const menuItems = [
    { icon: Globe, label: 'Language' },
    { icon: Megaphone, label: 'Announcement' },
    { icon: Headset, label: '24/7 Customer service' },
    { icon: BookOpen, label: 'Beginner\'s Guide' },
    { icon: Info, label: 'About us' },
  ];

  return (
    <div className="px-4 pb-24 flex flex-col gap-6">
      {/* Brand Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-3xl font-black text-white italic tracking-tighter">
            Breeww
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 border-2 border-red-500 rounded-full flex items-center justify-center">
            <span className="text-red-500 font-black text-xs">+18</span>
          </div>
          <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center shadow-lg shadow-red-500/30">
            <Phone size={20} className="text-white" />
          </div>
        </div>
      </div>

      {/* Info Blocks */}
      <div className="flex flex-col gap-4 text-xs text-gray-400 font-medium leading-relaxed">
        <div className="flex gap-2">
          <span className="text-[#5D87E6] text-sm shrink-0">◆</span>
          <p>The platform advocates fairness, justice, and openness. We mainly operate fair lottery, blockchain games, live casinos, and slot machine games.</p>
        </div>
        <div className="flex gap-2">
          <span className="text-[#5D87E6] text-sm shrink-0">◆</span>
          <p>Breeww works with more than 10,000 online live game dealers and slot games, all of which are verified fair games.</p>
        </div>
        <div className="flex gap-2">
          <span className="text-[#5D87E6] text-sm shrink-0">◆</span>
          <p>Breeww supports fast deposit and withdrawal, and looks forward to your visit.</p>
        </div>
      </div>

      {/* Legal warning */}
      <div className="flex flex-col gap-1">
        <p className="text-red-500/80 text-[11px] font-bold italic tracking-tight">Gambling can be addictive, please play rationally.</p>
        <p className="text-red-500/80 text-[11px] font-bold italic tracking-tight">Breeww only accepts customers above the age of 18.</p>
      </div>

      {/* Quick Links Menu */}
      <div className="bg-[#242E4D] rounded-2xl overflow-hidden border border-white/5 shadow-xl">
        {menuItems.map((item, idx) => (
          <button 
            key={idx}
            className={`w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors ${idx !== menuItems.length - 1 ? 'border-b border-white/5' : ''}`}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#313C5E] flex items-center justify-center">
                <item.icon size={20} className="text-[#5D87E6]" />
              </div>
              <span className="text-sm font-black text-gray-200 tracking-tight">{item.label}</span>
            </div>
            <ChevronRight size={18} className="text-gray-500" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default PlatformFooter;
