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
      color: 'text-indigo-400',
      progress: 100,
      actionText: 'Deposit Now',
      action: () => navigateTo('/wallet'),
    },
    {
      id: 'cashback',
      title: 'Weekly Cashback',
      description: 'Get 10% back on all net losses every Monday',
      icon: Award,
      color: 'text-yellow-400',
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
      color: 'text-orange-400',
      progress: 70,
      actionText: 'Play Aviator',
      action: () => navigateTo('/game/aviator'),
    },
    {
      id: 'vip',
      title: 'VIP Loyalty Program',
      description: 'Level up your VIP tier to unlock higher cashback and rakeback',
      icon: Star,
      color: 'text-purple-400',
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
    <div className="pb-24 px-4 pt-4 relative">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 text-white">
        <Gift size={24} className="text-casino-gold" /> Bonuses & Rewards
      </h1>

      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-white px-6 py-3 rounded-full text-sm font-bold shadow-2xl flex items-center gap-2 animate-fadeIn max-w-[90%] text-center">
          <CheckCircle2 size={18} /> {toastMessage}
        </div>
      )}

      <div className="space-y-4">
        {bonuses.map((bonus) => {
          const isClaimed = claimedBonuses[bonus.id];
          return (
            <div
              key={bonus.id}
              className="bg-casino-card rounded-2xl p-5 sm:p-6 shadow-xl border border-gray-800 hover:border-casino-accent/50 transition-colors group"
            >
              <div className="flex items-start justify-between mb-4 gap-3">
                <div className="flex items-center gap-3.5">
                  <div className={`p-3 rounded-2xl bg-gray-800/50 group-hover:bg-casino-accent/10 transition-colors shrink-0 ${bonus.color}`}>
                    <bonus.icon size={26} />
                  </div>
                  <div>
                    <h3 className="font-bold text-base sm:text-lg text-white">{bonus.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-400">{bonus.description}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleClaim(bonus)}
                  disabled={isClaimed}
                  className={`text-xs font-black px-4 py-2.5 rounded-xl uppercase tracking-wider shadow-lg active:scale-95 transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                    isClaimed
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-default'
                      : 'bg-casino-accent hover:bg-indigo-500 text-white shadow-indigo-500/20'
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

              <div className="mt-4 pt-3 border-t border-white/5">
                <div className="flex justify-between text-xs mb-1.5 text-gray-400 font-bold">
                  <span>Requirement Progress</span>
                  <span className="text-white">{bonus.progress}%</span>
                </div>
                <div className="w-full bg-gray-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-casino-gold transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)] rounded-full"
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
