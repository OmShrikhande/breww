import React, { useState } from 'react';
import { User, Wallet, Settings, LogOut, Shield, MessageCircle, Heart, Bell, Copy, CheckCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../hooks/useWallet';
import { formatINR } from '../utils/formatCurrency';
import { navigateTo } from '../lib/navigation';

const Account = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { balance } = useWallet();
  const [loggingOut, setLoggingOut] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logout();
      navigateTo('/login');
    } catch {
      // Logout should always succeed since clear() runs regardless
      navigateTo('/login');
    }
  };

  const displayName = user?.name || user?.email?.split('@')[0] || user?.phone || 'Guest';
  const initials = displayName.slice(0, 2).toUpperCase();
  const userId = user?.id ? String(user.id).padStart(10, '0') : '—';
  const displayEmail = user?.email || '—';
  const displayPhone = user?.phone ? `+91 ${user.phone}` : '—';

  const handleCopyId = () => {
    navigator.clipboard?.writeText(userId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const menuItems = [
    { label: 'Wallet', icon: Wallet, color: 'text-green-400', href: '/wallet' },
    { label: 'Favorites', icon: Heart, color: 'text-red-400' },
    { label: 'Notifications', icon: Bell, color: 'text-blue-400', href: '/notifications' },
    { label: 'Security', icon: Shield, color: 'text-yellow-400' },
    { label: 'Support', icon: MessageCircle, color: 'text-cyan-400' },
    { label: 'Settings', icon: Settings, color: 'text-gray-400' },
  ];

  return (
    <div className="pb-20">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <User size={24} /> My Profile
      </h1>

      {/* Profile Card */}
      <div className="bg-casino-card rounded-2xl p-8 mb-8 text-center shadow-2xl border border-gray-800 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-casino-accent/5 rounded-bl-full group-hover:bg-casino-accent/10 transition-colors duration-500" />
        <div className="relative z-10">
          <div className="w-24 h-24 rounded-full bg-indigo-900 mx-auto flex items-center justify-center text-3xl font-bold text-white mb-4 border-4 border-gray-800 shadow-2xl group-hover:scale-110 transition-transform duration-500">
            {initials}
          </div>
          <h2 className="text-2xl font-bold mb-1 tracking-tight capitalize">{displayName}</h2>
          <div className="flex items-center justify-center gap-2 mb-1">
            <p className="text-sm text-gray-500 font-medium uppercase tracking-widest">ID: {userId}</p>
            <button
              type="button"
              onClick={handleCopyId}
              className="p-1 rounded-md hover:bg-white/10 transition-colors text-gray-500 hover:text-white cursor-pointer"
              title="Copy ID"
            >
              {copied ? <CheckCheck size={14} className="text-emerald-400" /> : <Copy size={14} />}
            </button>
          </div>
          {displayEmail !== '—' && (
            <p className="text-xs text-gray-500">{displayEmail}</p>
          )}
          {displayPhone !== '—' && (
            <p className="text-xs text-gray-500">{displayPhone}</p>
          )}

          <div className="bg-gray-800/40 px-6 py-4 rounded-2xl flex items-center justify-between border border-gray-800 backdrop-blur-sm mt-4">
            <div className="text-left">
              <span className="text-xs text-gray-400 block font-bold uppercase tracking-tighter">Available Balance</span>
              <span className="text-2xl font-black text-green-400 font-mono tracking-tighter">{formatINR(balance)}</span>
            </div>
            <button
              type="button"
              onClick={() => navigateTo('/wallet')}
              className="bg-green-600 hover:bg-green-500 px-6 py-3 rounded-xl font-bold text-white shadow-lg active:scale-95 transition-all text-sm uppercase tracking-wider cursor-pointer"
            >
              Withdraw
            </button>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="bg-casino-card rounded-2xl overflow-hidden shadow-xl border border-gray-800 mb-8 divide-y divide-gray-800">
        {menuItems.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => item.href && navigateTo(item.href)}
            className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors group cursor-pointer"
          >
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

      {/* Logout Button */}
      <button
        type="button"
        onClick={handleLogout}
        disabled={loggingOut}
        className="w-full flex items-center justify-center gap-2 p-5 text-red-400 bg-red-950/20 hover:bg-red-950/40 rounded-2xl border border-red-900/50 font-bold transition-all shadow-lg active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <LogOut size={20} />
        {loggingOut ? 'Logging out…' : 'Log Out'}
      </button>
    </div>
  );
};

export default Account;
