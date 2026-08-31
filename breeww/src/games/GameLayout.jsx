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
    <div className="fixed inset-0 z-[60] bg-[#070b19] flex justify-center overflow-hidden h-[100dvh] w-full select-none">
      <div className={`w-full ${isWide ? 'lg:max-w-none' : 'max-w-md'} game-shell-bg flex flex-col h-full relative shadow-2xl border-x border-white/5 overflow-hidden`}>
        {!hideHeader && (
          <header className="h-12 sm:h-14 shrink-0 border-b border-white/10 flex items-center justify-between px-3 sm:px-4 bg-black/40 backdrop-blur-md z-20">
            <div className="flex items-center gap-2 min-w-0">
              <button
                type="button"
                onClick={() => navigateTo('/')}
                className="p-1.5 -ml-1 rounded-xl hover:bg-white/10 transition-colors text-white/80 cursor-pointer"
                aria-label="Back to Lobby"
              >
                <ChevronLeft size={22} />
              </button>
              <div className="min-w-0">
                <p className="font-black text-white text-xs sm:text-sm uppercase tracking-wide truncate">{title}</p>
                {subtitle && <p className="text-[9px] sm:text-[10px] text-white/40 truncate">{subtitle}</p>}
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigateTo('/wallet')}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-casino-gold/10 border border-casino-gold/30 cursor-pointer"
            >
              <Coins size={13} className="text-casino-gold" />
              <span className="font-black text-casino-gold text-[11px] sm:text-xs tabular-nums">{formatINR(balance)}</span>
            </button>
          </header>
        )}

        <main className={`flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar flex flex-col justify-between ${isWide ? '' : 'p-2 sm:p-3 pb-2'}`}>
          <div className="flex flex-col flex-1 min-h-0 justify-between gap-2">
            {children}
          </div>
        </main>

        {!hideBetPanel && (
          <footer className="shrink-0 border-t border-white/10 bg-[#0d1424]/95 backdrop-blur-lg z-20 pb-safe">
            {selectedLabel && (
              <div className="px-3 pt-1.5 text-center">
                <span className="text-[9px] font-bold uppercase tracking-widest text-white/40">Selected: </span>
                <span className="text-[11px] font-black text-casino-gold">{selectedLabel}</span>
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
