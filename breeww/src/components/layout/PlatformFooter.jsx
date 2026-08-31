import React, { useState } from 'react';
import { Megaphone, Headset, BookOpen, Info, ChevronRight, X } from 'lucide-react';
import { navigateTo } from '../../lib/navigation';

const PlatformFooter = () => {
  const [activeModal, setActiveModal] = useState(null);

  const handleMenuClick = (label) => {
    if (label === 'Announcement') {
      navigateTo('/notifications');
    } else if (label === '24/7 Customer service') {
      setActiveModal('support');
    } else if (label === "Beginner's Guide") {
      setActiveModal('guide');
    } else if (label === 'About us') {
      setActiveModal('about');
    }
  };

  const menuItems = [
    { icon: Megaphone, label: 'Announcement', subtitle: 'Latest platform news' },
    { icon: Headset, label: '24/7 Customer service', subtitle: 'Live chat & ticket support' },
    { icon: BookOpen, label: "Beginner's Guide", subtitle: 'How to play & deposit' },
    { icon: Info, label: 'About us', subtitle: 'Provably fair gaming' },
  ];

  return (
    <div className="px-4 pb-24 flex flex-col gap-6 select-none">
      {/* Brand Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-3xl font-black text-white italic tracking-tighter">
            Breeww
          </span>
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            Official
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 border-2 border-red-500 rounded-full flex items-center justify-center">
            <span className="text-red-500 font-black text-xs">+18</span>
          </div>
          <button
            type="button"
            onClick={() => setActiveModal('support')}
            className="w-9 h-9 bg-emerald-500 hover:bg-emerald-400 active:scale-95 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30 transition-all cursor-pointer"
            title="24/7 Live Support"
          >
            <Headset size={18} className="text-white" />
          </button>
        </div>
      </div>

      {/* Info Blocks */}
      <div className="flex flex-col gap-3 text-xs text-gray-400 font-medium leading-relaxed bg-[#1a233d]/60 p-4 rounded-2xl border border-white/5">
        <div className="flex gap-2">
          <span className="text-[#5D87E6] text-sm shrink-0">◆</span>
          <p>The platform advocates fairness, justice, and openness. We operate provably fair games with real-time multiplayer resolution.</p>
        </div>
        <div className="flex gap-2">
          <span className="text-[#5D87E6] text-sm shrink-0">◆</span>
          <p>Instant deposit and fast automated withdrawal processing 24/7 across India.</p>
        </div>
      </div>

      {/* Legal warning */}
      <div className="flex flex-col gap-0.5 px-1">
        <p className="text-red-400/90 text-[11px] font-bold italic tracking-tight">Gaming involves financial risk. Please play responsibly.</p>
        <p className="text-gray-500 text-[10px]">Breeww strictly accepts players aged 18 and older.</p>
      </div>

      {/* Quick Links Menu */}
      <div className="bg-[#242E4D] rounded-2xl overflow-hidden border border-white/5 shadow-xl divide-y divide-white/5">
        {menuItems.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleMenuClick(item.label)}
            className="w-full flex items-center justify-between p-4 hover:bg-white/5 active:bg-white/10 transition-colors cursor-pointer text-left"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#313C5E] flex items-center justify-center text-[#5D87E6]">
                <item.icon size={20} />
              </div>
              <div>
                <span className="text-sm font-black text-gray-200 tracking-tight block">{item.label}</span>
                <span className="text-[10px] text-gray-400 font-medium">{item.subtitle}</span>
              </div>
            </div>
            <ChevronRight size={18} className="text-gray-500" />
          </button>
        ))}
      </div>

      {/* 24/7 Support Modal */}
      {activeModal === 'support' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[130] flex items-center justify-center p-4">
          <div className="bg-[#1B233D] rounded-3xl p-6 border border-white/10 max-w-sm w-full text-white shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black text-base uppercase text-emerald-400 flex items-center gap-2">
                <Headset size={20} /> 24/7 Customer Support
              </h3>
              <button type="button" onClick={() => setActiveModal(null)} className="p-1 hover:text-red-400 cursor-pointer">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3 text-xs text-gray-300">
              <p>Our dedicated support team is available round the clock to assist you with deposits, withdrawals, and game rules.</p>
              <div className="bg-black/30 p-3 rounded-xl border border-white/5 space-y-1.5">
                <p><strong className="text-white">Email:</strong> support@breeww.games</p>
                <p><strong className="text-white">Telegram:</strong> @BreewwOfficialSupport</p>
                <p><strong className="text-white">Response Time:</strong> Under 5 minutes</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Beginner's Guide Modal */}
      {activeModal === 'guide' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[130] flex items-center justify-center p-4">
          <div className="bg-[#1B233D] rounded-3xl p-6 border border-white/10 max-w-sm w-full text-white shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black text-base uppercase text-casino-gold flex items-center gap-2">
                <BookOpen size={20} /> Beginner's Guide
              </h3>
              <button type="button" onClick={() => setActiveModal(null)} className="p-1 hover:text-red-400 cursor-pointer">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3 text-xs text-gray-300 leading-relaxed">
              <p><strong>1. Deposit Funds:</strong> Head over to Wallet and tap Recharge to add coins instantly.</p>
              <p><strong>2. Choose a Game:</strong> Explore Aviator, Mines, Color Prediction, Andar Bahar, and more.</p>
              <p><strong>3. Place Stake:</strong> Pick your stake and cash out before the crash or reveal safe gems.</p>
              <p><strong>4. Withdraw:</strong> Withdraw your winnings 24/7 directly to your bank account or UPI.</p>
            </div>
          </div>
        </div>
      )}

      {/* About Us Modal */}
      {activeModal === 'about' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[130] flex items-center justify-center p-4">
          <div className="bg-[#1B233D] rounded-3xl p-6 border border-white/10 max-w-sm w-full text-white shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black text-base uppercase text-casino-gold flex items-center gap-2">
                <Info size={20} /> About Breeww
              </h3>
              <button type="button" onClick={() => setActiveModal(null)} className="p-1 hover:text-red-400 cursor-pointer">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3 text-xs text-gray-300 leading-relaxed">
              <p>Breeww is a next-generation real-time gaming platform offering provably fair multiplayer and singleplayer games.</p>
              <p>Built with enterprise-grade security, instant automated settlement, and verified RNG mechanisms.</p>
              <p className="text-[10px] text-gray-500">Version 2.4.0 · Licensed & Regulated</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlatformFooter;
