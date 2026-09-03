import React from 'react';
import { Bell, Coins, LogIn, Crown, Sparkles } from 'lucide-react';
import { useWallet } from '../../hooks/useWallet';
import { useAuth } from '../../context/AuthContext';
import { formatINR } from '../../utils/formatCurrency';
import { navigateTo } from '../../lib/navigation';

const Header = () => {
  const { balance } = useWallet();
  const { isAuthenticated } = useAuth();

  return (
    <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md h-14 bg-[#140202]/90 backdrop-blur-md flex items-center justify-between px-4 shrink-0 z-[100] border-b border-amber-500/30 shadow-lg">
      <div 
        onClick={() => navigateTo('/')}
        className="flex items-center gap-2 cursor-pointer select-none"
      >
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-red-950 font-black shadow-md border border-white/40">
          <Crown size={18} className="fill-current" />
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-black italic tracking-tighter gold-text-gradient drop-shadow">
            Breeww
          </span>
          <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/15 px-1.5 py-0.2 rounded border border-emerald-500/30">
            Live
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isAuthenticated ? (
          <button
            type="button"
            onClick={() => navigateTo('/wallet')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border border-amber-400/40 shadow-inner hover:border-amber-400 transition-all active:scale-95 cursor-pointer"
          >
            <Coins size={15} className="text-amber-400" />
            <span className="text-xs font-black text-amber-300 tabular-nums font-mono">{formatINR(balance)}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => navigateTo('/login')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-red-950 text-xs font-black uppercase tracking-wider border border-white/60 shadow-md hover:brightness-110 active:scale-95 cursor-pointer transition-all"
          >
            <LogIn size={14} />
            <span>Login</span>
          </button>
        )}
        <button
          type="button"
          onClick={() => navigateTo('/notifications')}
          className="w-9 h-9 rounded-full bg-white/5 border border-white/10 hover:bg-white/15 text-amber-300 hover:text-white transition-all relative flex items-center justify-center cursor-pointer"
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#140202] shadow-sm animate-pulse" />
        </button>
      </div>
    </header>
  );
};

export default Header;
