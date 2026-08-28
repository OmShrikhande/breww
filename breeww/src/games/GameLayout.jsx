import React from 'react';
import { ChevronLeft, Coins } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { formatINR } from '../utils/formatCurrency';
import BetPanel from '../components/betting/BetPanel';
import { navigateTo } from '../lib/navigation';

const GameLayout = ({
  title,
  subtitle,
  accent = '#4F8EF7',
  children,
  onPlaceBet,
  betDisabled,
  isWide = false,
  hideBetPanel = false,
  hideHeader = false,
  selectedLabel,
}) => {
  const { balance } = useWallet();

  return (
    <div className="fixed inset-0 z-[60] bg-[#5a6270] flex justify-center overflow-hidden">
      <div className={`w-full ${isWide ? 'lg:max-w-none' : 'max-w-md'} game-shell-bg flex flex-col h-full relative shadow-2xl border-x border-white/5`}>
        {!hideHeader && (
          <header className="h-14 shrink-0 border-b border-white/10 flex items-center justify-between px-4 bg-black/30 backdrop-blur-md z-20">
            <div className="flex items-center gap-2 min-w-0">
              <button
                type="button"
                onClick={() => navigateTo('/')}
                className="p-2 -ml-1 rounded-xl hover:bg-white/10 transition-colors text-white/80"
              >
                <ChevronLeft size={22} />
              </button>
              <div className="min-w-0">
                <p className="font-black text-white text-sm uppercase tracking-wide truncate">{title}</p>
                {subtitle && <p className="text-[10px] text-white/40 truncate">{subtitle}</p>}
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigateTo('/wallet')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-casino-gold/10 border border-casino-gold/30"
            >
              <Coins size={14} className="text-casino-gold" />
              <span className="font-black text-casino-gold text-xs tabular-nums">{formatINR(balance)}</span>
            </button>
          </header>
        )}

        <main className={`flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar ${isWide ? '' : 'px-4 pt-4 pb-4'}`}>
          <div
            className="h-0.5 w-full rounded-full mb-4 opacity-60"
            style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
          />
          {children}
        </main>

        {!hideBetPanel && (
          <footer className="shrink-0 border-t border-white/10 bg-casino-elevated/95 backdrop-blur-lg z-20 pb-safe">
            {selectedLabel && (
              <div className="px-4 pt-2 text-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Selected: </span>
                <span className="text-xs font-black text-casino-gold">{selectedLabel}</span>
              </div>
            )}
            <BetPanel onPlaceBet={onPlaceBet} disabled={betDisabled} accent={accent} />
          </footer>
        )}
      </div>
    </div>
  );
};

export default GameLayout;
