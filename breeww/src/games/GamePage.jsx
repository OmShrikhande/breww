import React from 'react';
import { ChevronLeft, Maximize2, Info, Settings } from 'lucide-react';
import { navigateTo } from '../lib/navigation';

const GamePage = ({ name = 'Game' }) => {
  const gameName = name;

  return (
    <div className="fixed inset-0 z-[60] bg-casino-dark flex flex-col">
      {/* Game Header */}
      <header className="h-14 bg-casino-card border-b border-gray-800 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigateTo('/')} 
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <span className="font-bold text-lg">{gameName}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-gray-800 px-4 py-1.5 rounded-full font-mono font-bold text-green-400 text-sm shadow-inner border border-white/5">
            $12,450.00
          </div>
          <button className="text-gray-400 hover:text-white transition-colors">
            <Info size={20} />
          </button>
        </div>
      </header>

      {/* Game Area */}
      <main className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
        <div className="text-center">
          <div className="w-32 h-32 mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-casino-accent opacity-20 blur-3xl rounded-full animate-pulse"></div>
            <div className="relative z-10 w-full h-full bg-casino-card rounded-3xl border-2 border-casino-accent flex items-center justify-center shadow-[0_0_50px_rgba(99,102,241,0.3)]">
              <span className="text-4xl">🎮</span>
            </div>
          </div>
          <h2 className="text-2xl font-black mb-2 tracking-tighter uppercase italic">{gameName}</h2>
          <p className="text-gray-500 font-bold tracking-widest text-xs uppercase mb-8">Loading Game Engine...</p>
          <div className="w-64 h-2 bg-gray-900 rounded-full mx-auto overflow-hidden shadow-inner border border-white/5">
            <div className="h-full bg-casino-accent w-2/3 rounded-full shadow-[0_0_15px_rgba(99,102,241,1)]"></div>
          </div>
        </div>

        {/* Controls Overlay */}
        <div className="absolute bottom-6 right-6 flex flex-col gap-3">
          <button className="p-3 bg-casino-card/80 backdrop-blur-md rounded-2xl border border-white/10 text-gray-400 hover:text-white hover:scale-110 transition-all shadow-xl">
            <Settings size={20} />
          </button>
          <button className="p-3 bg-casino-card/80 backdrop-blur-md rounded-2xl border border-white/10 text-gray-400 hover:text-white hover:scale-110 transition-all shadow-xl">
            <Maximize2 size={20} />
          </button>
        </div>
      </main>

      {/* Game Footer / Betting Panel */}
      <footer className="h-24 bg-casino-card border-t border-gray-800 p-4 shrink-0 flex items-center justify-between gap-4">
        <div className="flex-1 flex items-center bg-gray-900 rounded-2xl p-1 border border-white/5 shadow-inner h-full overflow-hidden">
          <button className="w-12 h-full flex items-center justify-center text-gray-400 font-black text-xl hover:bg-white/5 transition-colors">
            -
          </button>
          <div className="flex-1 text-center font-mono font-black text-lg">
            $10.00
          </div>
          <button className="w-12 h-full flex items-center justify-center text-gray-400 font-black text-xl hover:bg-white/5 transition-colors">
            +
          </button>
        </div>
        <button className="flex-[2] h-full bg-green-600 hover:bg-green-500 rounded-2xl font-black text-xl uppercase italic tracking-tighter shadow-[0_5px_0_rgb(22,101,52)] active:translate-y-1 active:shadow-none transition-all duration-75">
          Bet
        </button>
      </footer>
    </div>
  );
};

export default GamePage;
