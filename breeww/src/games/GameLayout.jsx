import React from 'react';
import { ChevronLeft, Info } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { formatINR } from '../utils/formatCurrency';
import BetPanel from '../components/betting/BetPanel';
import { navigateTo } from '../lib/navigation';

const GameLayout = ({ title, children, onPlaceBet, betDisabled, isWide = false, hideBetPanel = false, hideHeader = false }) => {
  const { balance } = useWallet();

  return (
    <div className="fixed inset-0 z-[60] bg-[#8c919e] flex justify-center overflow-hidden">
      <div className={`w-full ${isWide ? 'lg:max-w-none' : 'max-w-md'} bg-[#1B233D] flex flex-col h-full relative shadow-2xl border-x border-white/5`}>
        {/* Game Header */}
        {!hideHeader && (
          <header className="h-14 bg-[#242E4D] border-b border-white/5 flex items-center justify-between px-4 shrink-0 shadow-lg relative z-20">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigateTo('/')} 
                className="p-1 hover:bg-white/10 rounded-lg transition-colors text-white"
              >
                <ChevronLeft size={24} />
              </button>
              <span className="font-bold tracking-tight text-white uppercase text-sm">{title}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-[#1B233D] px-3 py-1.5 rounded-full font-bold text-[#FFD700] text-xs border border-white/5 shadow-inner">
                {formatINR(balance)}
              </div>
            </div>
          </header>
        )}

        {/* Main Game Content Area */}
        <main className={`flex-1 relative overflow-y-auto overflow-x-hidden ${isWide ? '' : 'px-4 pt-4 pb-12'} custom-scrollbar scroll-smooth`}>
          <div className={`flex flex-col ${isWide ? 'w-full h-full' : 'gap-4'}`}>
            {children}
          </div>
        </main>

        {/* Reusable Bet Panel */}
        {!hideBetPanel && (
          <footer className="shrink-0 bg-[#242E4D] border-t border-white/5 shadow-[0_-4px_20px_rgba(0,0,0,0.5)] z-20">
            <div className={`${isWide ? 'w-full' : ''}`}>
              <BetPanel onPlaceBet={onPlaceBet} disabled={betDisabled} />
            </div>
          </footer>
        )}
      </div>
    </div>
  );
};

export default GameLayout;
