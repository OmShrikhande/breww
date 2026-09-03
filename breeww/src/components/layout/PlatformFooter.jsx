import React, { useState } from 'react';
import { Megaphone, Headset, BookOpen, Info, ChevronRight, X, Crown } from 'lucide-react';
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
    <div className="px-4 pb-24 flex flex-col gap-5 select-none">
      {/* Brand Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-red-950 font-black shadow-md border border-white/40">
            <Crown size={20} className="fill-current" />
          </div>
          <span className="text-2xl font-black italic tracking-tighter gold-text-gradient drop-shadow">
            Breeww
          </span>
          <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full uppercase">
            Official
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 border-2 border-red-500/80 rounded-full flex items-center justify-center bg-red-950/40">
            <span className="text-red-400 font-black text-xs">+18</span>
          </div>
          <button
            type="button"
            onClick={() => setActiveModal('support')}
            className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-600 active:scale-95 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30 transition-all cursor-pointer border border-white/40"
            title="24/7 Live Support"
          >
            <Headset size={16} className="text-white" />
          </button>
        </div>
      </div>

      {/* Info Blocks */}
      <div className="flex flex-col gap-2.5 text-xs text-amber-100/70 font-medium leading-relaxed bg-[#1C0202]/90 p-4 rounded-2xl border border-amber-500/20 shadow-md">
        <div className="flex gap-2">
          <span className="text-amber-400 text-sm shrink-0">◆</span>
          <p>The platform advocates fairness, justice, and openness. We operate provably fair games with real-time multiplayer resolution.</p>
        </div>
        <div className="flex gap-2">
          <span className="text-amber-400 text-sm shrink-0">◆</span>
          <p>Instant deposit and fast automated withdrawal processing 24/7 across India.</p>
        </div>
      </div>

      {/* Legal warning */}
      <div className="flex flex-col gap-0.5 px-1">
        <p className="text-amber-400/90 text-[11px] font-bold italic tracking-tight">Gaming involves financial risk. Please play responsibly.</p>
        <p className="text-white/40 text-[10px]">Breeww strictly accepts players aged 18 and older.</p>
      </div>

      {/* Quick Links Menu */}
      <div className="bg-[#180202] rounded-2xl overflow-hidden border border-amber-500/20 shadow-xl divide-y divide-amber-500/10">
        {menuItems.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleMenuClick(item.label)}
            className="w-full flex items-center justify-between p-3.5 hover:bg-white/5 active:bg-white/10 transition-colors cursor-pointer text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <item.icon size={18} />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-black text-white tracking-tight block">{item.label}</span>
                <span className="text-[10px] text-white/50 font-medium">{item.subtitle}</span>
              </div>
            </div>
            <ChevronRight size={16} className="text-amber-400/60" />
          </button>
        ))}
      </div>

      {/* 24/7 Support Modal */}
      {activeModal === 'support' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[130] flex items-center justify-center p-4">
          <div className="bg-[#1C0202] rounded-3xl p-6 border-2 border-amber-500/40 max-w-sm w-full text-white shadow-2xl">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-amber-500/20">
              <h3 className="font-black text-sm uppercase text-amber-300 flex items-center gap-2">
                <Headset size={18} /> 24/7 Customer Support
              </h3>
              <button type="button" onClick={() => setActiveModal(null)} className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white cursor-pointer">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-3 text-xs text-white/80">
              <p>Our dedicated support team is available round the clock to assist you with deposits, withdrawals, and game rules.</p>
              <div className="bg-black/50 p-3 rounded-xl border border-white/10 space-y-1.5 font-medium">
                <p><strong className="text-amber-300">Email:</strong> support@breeww.games</p>
                <p><strong className="text-amber-300">Telegram:</strong> @BreewwOfficialSupport</p>
                <p><strong className="text-amber-300">Response Time:</strong> Under 5 minutes</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Beginner's Guide Modal */}
      {activeModal === 'guide' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[130] flex items-center justify-center p-4">
          <div className="bg-[#1C0202] rounded-3xl p-6 border-2 border-amber-500/40 max-w-sm w-full text-white shadow-2xl">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-amber-500/20">
              <h3 className="font-black text-sm uppercase text-amber-300 flex items-center gap-2">
                <BookOpen size={18} /> Beginner's Guide
              </h3>
              <button type="button" onClick={() => setActiveModal(null)} className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white cursor-pointer">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-3 text-xs text-white/80 leading-relaxed">
              <p><strong className="text-amber-300">1. Deposit Funds:</strong> Head over to Wallet and tap Recharge to add coins instantly.</p>
              <p><strong className="text-amber-300">2. Choose a Game:</strong> Explore Aviator, Mines, Color Prediction, Andar Bahar, and more.</p>
              <p><strong className="text-amber-300">3. Place Stake:</strong> Pick your stake and cash out before the crash or reveal safe gems.</p>
              <p><strong className="text-amber-300">4. Withdraw:</strong> Withdraw your winnings 24/7 directly to your bank account or UPI.</p>
            </div>
          </div>
        </div>
      )}

      {/* About Us Modal */}
      {activeModal === 'about' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[130] flex items-center justify-center p-4">
          <div className="bg-[#1C0202] rounded-3xl p-6 border-2 border-amber-500/40 max-w-sm w-full text-white shadow-2xl">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-amber-500/20">
              <h3 className="font-black text-sm uppercase text-amber-300 flex items-center gap-2">
                <Info size={18} /> About Breeww
              </h3>
              <button type="button" onClick={() => setActiveModal(null)} className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white cursor-pointer">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-3 text-xs text-white/80 leading-relaxed">
              <p>Breeww is a next-generation real-time gaming platform offering provably fair multiplayer and singleplayer games.</p>
              <p>Built with enterprise-grade security, instant automated settlement, and verified RNG mechanisms.</p>
              <p className="text-[10px] text-amber-400/60 font-mono">Version 2.4.0 · Licensed & Regulated</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlatformFooter;
