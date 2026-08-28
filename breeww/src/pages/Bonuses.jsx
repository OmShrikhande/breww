import React from 'react';
import { Gift, Award, Zap, Star } from 'lucide-react';

const Bonuses = () => {
  const bonuses = [
    { title: 'Welcome Bonus', description: 'Up to 100% bonus on your first deposit', icon: Gift, color: 'text-indigo-400', progress: 45 },
    { title: 'Weekly Cashback', description: 'Get 10% back on all losses every Monday', icon: Award, color: 'text-yellow-400', progress: 10 },
    { title: 'VIP Program', description: 'Unlock exclusive rewards and higher limits', icon: Star, color: 'text-purple-400', progress: 80 },
    { title: 'Daily Mission', description: 'Play 10 games of Aviator to earn ₹5', icon: Zap, color: 'text-orange-400', progress: 30 },
  ];

  return (
    <div className="pb-20">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Gift size={24} /> Bonuses & Rewards
      </h1>

      <div className="space-y-4">
        {bonuses.map((bonus, idx) => (
          <div key={idx} className="bg-casino-card rounded-2xl p-6 shadow-xl border border-gray-800 hover:border-casino-accent transition-colors group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl bg-gray-800/50 group-hover:bg-casino-accent/10 transition-colors ${bonus.color}`}>
                  <bonus.icon size={28} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{bonus.title}</h3>
                  <p className="text-sm text-gray-400">{bonus.description}</p>
                </div>
              </div>
              <button className="text-xs font-bold bg-casino-accent px-4 py-2 rounded-full uppercase tracking-widest shadow-lg active:scale-95 transition-all">
                Claim
              </button>
            </div>
            
            <div className="mt-6">
              <div className="flex justify-between text-xs mb-2 text-gray-500 uppercase font-bold">
                <span>Progress</span>
                <span>{bonus.progress}%</span>
              </div>
              <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-casino-accent transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]`}
                  style={{ width: `${bonus.progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Bonuses;
