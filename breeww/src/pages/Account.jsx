import React, { useState } from 'react';
import { User, Wallet, Settings, LogOut, Shield, MessageCircle, Heart, Bell, Copy, CheckCheck, X, Moon, Volume2, Lock, Smartphone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../hooks/useWallet';
import { formatINR } from '../utils/formatCurrency';
import { navigateTo } from '../lib/navigation';

const Account = () => {
  const { user, logout } = useAuth();
  const { balance } = useWallet();
  const [loggingOut, setLoggingOut] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [soundSetting, setSoundSetting] = useState(true);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2500);
  };

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logout();
      navigateTo('/login');
    } catch {
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
    { label: 'Favorites', icon: Heart, color: 'text-red-400', modal: 'favorites' },
    { label: 'Notifications', icon: Bell, color: 'text-blue-400', href: '/notifications' },
    { label: 'Security', icon: Shield, color: 'text-yellow-400', modal: 'security' },
    { label: 'Support', icon: MessageCircle, color: 'text-cyan-400', modal: 'support' },
    { label: 'Settings', icon: Settings, color: 'text-gray-400', modal: 'settings' },
  ];

  return (
    <div className="pb-24 px-4 pt-2 relative select-none">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 text-white">
        <User size={24} className="text-casino-gold" /> My Profile
      </h1>

      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[140] bg-emerald-500 text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-2xl animate-fadeIn">
          {toastMessage}
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-casino-card rounded-3xl p-6 sm:p-8 mb-6 text-center shadow-2xl border border-gray-800 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-casino-accent/5 rounded-bl-full group-hover:bg-casino-accent/10 transition-colors duration-500" />
        <div className="relative z-10">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-indigo-900 mx-auto flex items-center justify-center text-2xl sm:text-3xl font-black text-white mb-3 border-4 border-gray-800 shadow-2xl group-hover:scale-105 transition-transform duration-500">
            {initials}
          </div>
          <h2 className="text-xl sm:text-2xl font-black mb-1 tracking-tight capitalize text-white">{displayName}</h2>
          <div className="flex items-center justify-center gap-2 mb-1">
            <p className="text-xs sm:text-sm text-gray-400 font-medium uppercase tracking-widest">ID: {userId}</p>
            <button
              type="button"
              onClick={handleCopyId}
              className="p-1 rounded-md hover:bg-white/10 transition-colors text-gray-400 hover:text-white cursor-pointer"
              title="Copy ID"
            >
              {copied ? <CheckCheck size={14} className="text-emerald-400" /> : <Copy size={14} />}
            </button>
          </div>
          {displayEmail !== '—' && <p className="text-xs text-gray-400">{displayEmail}</p>}
          {displayPhone !== '—' && <p className="text-xs text-gray-400">{displayPhone}</p>}

          <div className="bg-gray-800/40 px-5 py-4 rounded-2xl flex items-center justify-between border border-gray-800 backdrop-blur-sm mt-4">
            <div className="text-left">
              <span className="text-[10px] text-gray-400 block font-bold uppercase tracking-wider">Available Balance</span>
              <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono tracking-tight">{formatINR(balance)}</span>
            </div>
            <button
              type="button"
              onClick={() => navigateTo('/wallet')}
              className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 px-5 py-2.5 rounded-xl font-bold text-white shadow-lg transition-all text-xs uppercase tracking-wider cursor-pointer"
            >
              Withdraw
            </button>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="bg-casino-card rounded-2xl overflow-hidden shadow-xl border border-gray-800 mb-6 divide-y divide-gray-800/80">
        {menuItems.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              if (item.href) navigateTo(item.href);
              else if (item.modal) setActiveModal(item.modal);
            }}
            className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-white/5 active:bg-white/10 transition-colors group cursor-pointer text-left"
          >
            <div className="flex items-center gap-3.5">
              <div className={`p-2.5 rounded-xl bg-gray-800/50 group-hover:bg-gray-700/50 transition-colors ${item.color}`}>
                <item.icon size={20} />
              </div>
              <span className="font-bold text-sm text-gray-200">{item.label}</span>
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
        className="w-full flex items-center justify-center gap-2 p-4 text-red-400 bg-red-950/20 hover:bg-red-950/40 rounded-2xl border border-red-900/50 font-bold transition-all shadow-lg active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        <LogOut size={18} />
        {loggingOut ? 'Logging out…' : 'Log Out'}
      </button>

      {/* Favorites Modal */}
      {activeModal === 'favorites' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[130] flex items-center justify-center p-4">
          <div className="bg-[#1B233D] rounded-3xl p-6 border border-white/10 max-w-sm w-full text-white shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black text-base uppercase text-red-400 flex items-center gap-2">
                <Heart size={18} /> Favorite Games
              </h3>
              <button type="button" onClick={() => setActiveModal(null)} className="p-1 hover:text-red-400 cursor-pointer">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-2 text-xs">
              {[
                { name: 'Aviator', path: '/game/aviator', mult: 'Crash' },
                { name: 'Mines', path: '/game/mines', mult: 'Provably Fair' },
                { name: 'Andar Bahar', path: '/game/andar-bahar', mult: 'Live 30s' },
                { name: 'Color Prediction', path: '/game/color-prediction', mult: 'WinGo' },
              ].map((g) => (
                <button
                  key={g.name}
                  type="button"
                  onClick={() => {
                    setActiveModal(null);
                    navigateTo(g.path);
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer text-left"
                >
                  <span className="font-bold text-white">{g.name}</span>
                  <span className="text-[10px] font-bold text-casino-gold bg-casino-gold/10 px-2 py-0.5 rounded">{g.mult}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Security Modal */}
      {activeModal === 'security' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[130] flex items-center justify-center p-4">
          <div className="bg-[#1B233D] rounded-3xl p-6 border border-white/10 max-w-sm w-full text-white shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black text-base uppercase text-yellow-400 flex items-center gap-2">
                <Shield size={18} /> Account Security
              </h3>
              <button type="button" onClick={() => setActiveModal(null)} className="p-1 hover:text-red-400 cursor-pointer">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3 text-xs text-gray-300">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock size={16} className="text-emerald-400" />
                  <span>Password Protected</span>
                </div>
                <span className="text-emerald-400 font-bold">Active</span>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone size={16} className="text-emerald-400" />
                  <span>Device Binding</span>
                </div>
                <span className="text-emerald-400 font-bold">Secured</span>
              </div>
              <p className="text-[10px] text-gray-500">All sessions are encrypted with TLS 1.3 enterprise security.</p>
            </div>
          </div>
        </div>
      )}

      {/* Support Modal */}
      {activeModal === 'support' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[130] flex items-center justify-center p-4">
          <div className="bg-[#1B233D] rounded-3xl p-6 border border-white/10 max-w-sm w-full text-white shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black text-base uppercase text-cyan-400 flex items-center gap-2">
                <MessageCircle size={18} /> 24/7 Live Support
              </h3>
              <button type="button" onClick={() => setActiveModal(null)} className="p-1 hover:text-red-400 cursor-pointer">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3 text-xs text-gray-300">
              <p>Need help with your account, deposit, or withdrawal?</p>
              <div className="bg-black/30 p-3 rounded-xl border border-white/5 space-y-1.5">
                <p><strong className="text-white">Email:</strong> support@breeww.games</p>
                <p><strong className="text-white">Telegram:</strong> @BreewwOfficialSupport</p>
                <p><strong className="text-white">Response:</strong> Instant 24/7</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {activeModal === 'settings' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[130] flex items-center justify-center p-4">
          <div className="bg-[#1B233D] rounded-3xl p-6 border border-white/10 max-w-sm w-full text-white shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black text-base uppercase text-gray-300 flex items-center gap-2">
                <Settings size={18} /> App Settings
              </h3>
              <button type="button" onClick={() => setActiveModal(null)} className="p-1 hover:text-red-400 cursor-pointer">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3 text-xs text-gray-300">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Volume2 size={16} className="text-casino-gold" />
                  <span>Game Sounds & Audio</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSoundSetting(!soundSetting);
                    showToast(!soundSetting ? '🔊 Audio enabled' : '🔇 Audio muted');
                  }}
                  className={`px-3 py-1 rounded-full font-bold text-[10px] uppercase transition-colors ${
                    soundSetting ? 'bg-emerald-500 text-white' : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  {soundSetting ? 'ON' : 'OFF'}
                </button>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Moon size={16} className="text-indigo-400" />
                  <span>Dark Mode Theme</span>
                </div>
                <span className="text-indigo-400 font-bold">Always On</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Account;
