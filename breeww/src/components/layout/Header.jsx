import { Bell, Coins, LogIn } from 'lucide-react';
import { useWallet } from '../../hooks/useWallet';
import { useAuth } from '../../context/AuthContext';
import { formatINR } from '../../utils/formatCurrency';
import { navigateTo } from '../../lib/navigation';

const Header = () => {
  const { balance } = useWallet();
  const { isAuthenticated } = useAuth();

  return (
    <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md h-14 bg-casino-base/95 backdrop-blur-md flex items-center justify-between px-4 shrink-0 z-[100] border-b border-white/5">
      <div className="flex items-center gap-2">
        <span className="text-xl font-black text-white italic tracking-tight">
          Breeww
        </span>
        <span className="hidden sm:inline text-[9px] font-bold uppercase tracking-widest text-emerald-400/80 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
          Live
        </span>
      </div>

      <div className="flex items-center gap-2">
        {isAuthenticated ? (
          <button
            type="button"
            onClick={() => navigateTo('/wallet')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-casino-gold/10 border border-casino-gold/25"
          >
            <Coins size={14} className="text-casino-gold" />
            <span className="text-xs font-black text-casino-gold tabular-nums">{formatINR(balance)}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => navigateTo('/login')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-casino-accent/20 border border-casino-accent/40 text-casino-accent text-xs font-black uppercase"
          >
            <LogIn size={14} />
            Login
          </button>
        )}
        <button
          type="button"
          onClick={() => navigateTo('/notifications')}
          className="p-2 text-white/50 hover:text-white transition-colors relative"
        >
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-casino-base" />
        </button>
      </div>
    </header>
  );
};

export default Header;
