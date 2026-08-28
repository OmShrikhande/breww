import React from 'react';
import { User, Wallet, Settings, LogOut, Shield, MessageCircle, Heart, Bell } from 'lucide-react';

const Account = () => {
  const menuItems = [
    { label: 'Wallet', icon: Wallet, color: 'text-green-400' },
    { label: 'Favorites', icon: Heart, color: 'text-red-400' },
    { label: 'Notifications', icon: Bell, color: 'text-blue-400' },
    { label: 'Security', icon: Shield, color: 'text-yellow-400' },
    { label: 'Support', icon: MessageCircle, color: 'text-cyan-400' },
    { label: 'Settings', icon: Settings, color: 'text-gray-400' },
  ];

  return (
    <div className="pb-20">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <User size={24} /> My Profile
      </h1>

      <div className="bg-casino-card rounded-2xl p-8 mb-8 text-center shadow-2xl border border-gray-800 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-casino-accent/5 rounded-bl-full group-hover:bg-casino-accent/10 transition-colors duration-500"></div>
        <div className="relative z-10">
          <div className="w-24 h-24 rounded-full bg-indigo-900 mx-auto flex items-center justify-center text-3xl font-bold text-white mb-4 border-4 border-gray-800 shadow-2xl group-hover:scale-110 transition-transform duration-500">
            BZ
          </div>
          <h2 className="text-2xl font-bold mb-1 tracking-tight">Breeww User</h2>
          <p className="text-sm text-gray-500 font-medium mb-6 uppercase tracking-widest">ID: 8273641293</p>
          <div className="bg-gray-800/40 px-6 py-4 rounded-2xl flex items-center justify-between border border-gray-800 backdrop-blur-sm">
            <div className="text-left">
              <span className="text-xs text-gray-400 block font-bold uppercase tracking-tighter">Available Balance</span>
              <span className="text-2xl font-black text-green-400 font-mono tracking-tighter">₹12,450.00</span>
            </div>
            <button className="bg-green-600 hover:bg-green-500 px-6 py-3 rounded-xl font-bold text-white shadow-lg active:scale-95 transition-all text-sm uppercase tracking-wider">
              Withdraw
            </button>
          </div>
        </div>
      </div>

      <div className="bg-casino-card rounded-2xl overflow-hidden shadow-xl border border-gray-800 mb-8 divide-y divide-gray-800">
        {menuItems.map((item, idx) => (
          <button key={idx} className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors group">
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-lg bg-gray-800/50 group-hover:bg-gray-700/50 transition-colors ${item.color}`}>
                <item.icon size={20} />
              </div>
              <span className="font-semibold text-gray-200">{item.label}</span>
            </div>
            <div className="text-gray-600 group-hover:text-gray-400 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        ))}
      </div>

      <button className="w-full flex items-center justify-center gap-2 p-5 text-red-400 bg-red-950/20 hover:bg-red-950/40 rounded-2xl border border-red-900/50 font-bold transition-all shadow-lg active:scale-95">
        <LogOut size={20} /> Log Out
      </button>
    </div>
  );
};

export default Account;
