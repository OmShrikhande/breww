import React, { useState } from 'react';
import { Gift, Award, Zap, Star, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { navigateTo } from '../lib/navigation';

const Bonuses = () => {
  const { isAuthenticated } = useAuth();
  const [toastMessage, setToastMessage] = useState('');
  const [claimedBonuses, setClaimedBonuses] = useState({});

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const bonuses = [
    {
      id: 'welcome',
      title: 'Welcome Bonus',
      description: 'Up to 100% bonus on your first deposit',
      icon: Gift,
      color: 'text-amber-400 bg-amber-500/20 border-amber-400/40',
      progress: 100,
      actionText: 'Deposit Now',
      action: () => navigateTo('/wallet'),
    },
    {
      id: 'cashback',
      title: 'Weekly Cashback',
      description: 'Get 10% back on all net losses every Monday',
      icon: Award,
      color: 'text-yellow-400 bg-yellow-500/20 border-yellow-400/40',
      progress: 65,
      actionText: 'Claim ₹50',
      action: () => {
        setClaimedBonuses((p) => ({ ...p, cashback: true }));
        showToast('🎉 Weekly Cashback of ₹50 credited to your wallet!');
      },
    },
    {
      id: 'mission',
      title: 'Daily Mission: Aviator',
      description: 'Play 10 rounds of Aviator to earn ₹25 bonus',
      icon: Zap,
      color: 'text-red-400 bg-red-500/20 border-red-400/40',
      progress: 70,
      actionText: 'Play Aviator',
      action: () => navigateTo('/game/aviator'),
    },
    {
      id: 'vip',
      title: 'VIP Loyalty Program',
      description: 'Level up your VIP tier to unlock higher cashback and rakeback',
      icon: Star,
      color: 'text-purple-400 bg-purple-500/20 border-purple-400/40',
      progress: 80,
      actionText: 'View VIP Perks',
      action: () => showToast('⭐ VIP Tier: Silver Level 2 · Next tier at 1,000 points!'),
    },
  ];

  const handleClaim = (bonus) => {
    if (!isAuthenticated) {
      navigateTo('/login');
      return;
    }
    bonus.action();
  };

  return (
    <div className="pb-24 px-4 pt-4 relative select-none animate-fadeIn">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-black flex items-center gap-2 text-white">
          <Gift size={22} className="text-amber-400" /> Bonuses & Rewards
        </h1>
        <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-500/20 border border-amber-400/30 px-2.5 py-1 rounded-full">
          Instant Credits
        </span>
      </div>

      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#1C0202] border-2 border-amber-400 text-amber-200 px-6 py-3 rounded-full text-xs font-black shadow-2xl flex items-center gap-2 animate-fadeIn max-w-[90%] text-center">
          <CheckCircle2 size={16} className="text-amber-400" /> {toastMessage}
        </div>
      )}

      <div className="space-y-3.5">
        {bonuses.map((bonus) => {
          const isClaimed = claimedBonuses[bonus.id];
          return (
            <div
              key={bonus.id}
              className="bg-[#1C0202]/95 rounded-3xl p-5 sm:p-6 shadow-xl border border-amber-500/30 hover:border-amber-400/50 transition-colors group"
            >
              <div className="flex items-start justify-between mb-4 gap-3">
                <div className="flex items-center gap-3.5">
                  <div className={`p-3 rounded-2xl border ${bonus.color} shrink-0`}>
                    <bonus.icon size={24} />
                  </div>
                  <div>
                    <h3 className="font-black text-base sm:text-lg text-white">{bonus.title}</h3>
                    <p className="text-xs sm:text-sm text-amber-100/70">{bonus.description}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleClaim(bonus)}
                  disabled={isClaimed}
                  className={`text-xs font-black px-4 py-2.5 rounded-xl uppercase tracking-wider shadow-lg active:scale-95 transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                    isClaimed
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-default'
                      : 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-red-950 hover:brightness-110 shadow-[0_0_12px_rgba(255,215,0,0.3)] border border-white/80'
                  }`}
                >
                  {isClaimed ? (
                    <>
                      <CheckCircle2 size={14} /> Claimed
                    </>
                  ) : (
                    <>
                      {bonus.actionText} <ArrowRight size={13} />
                    </>
                  )}
                </button>
              </div>

              <div className="mt-4 pt-3 border-t border-amber-500/20">
                <div className="flex justify-between text-xs mb-1.5 text-amber-200/70 font-bold">
                  <span>Requirement Progress</span>
                  <span className="text-amber-400 font-mono font-black">{bonus.progress}%</span>
                </div>
                <div className="w-full bg-black/60 h-2.5 rounded-full overflow-hidden border border-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(255,215,0,0.5)] rounded-full"
                    style={{ width: `${bonus.progress}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Bonuses;
