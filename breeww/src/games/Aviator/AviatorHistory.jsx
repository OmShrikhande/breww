import React from 'react';
import { History, ChevronDown } from 'lucide-react';

const AviatorHistory = ({ history }) => {
  return (
    <div className="bg-[#1c1c1e]/90 backdrop-blur-md rounded-full px-2 py-1.5 border border-white/5 flex items-center justify-between shadow-2xl relative z-30 m-2">
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth w-full px-2">
        {history.length > 0 ? (
          history.map((h, i) => (
            <div
              key={h.id || i}
              className={`px-3 py-1 rounded-full text-[11px] font-bold tabular-nums shrink-0 shadow-inner transition-all hover:scale-105 active:scale-95 ${
                h.multiplier >= 10 ? 'bg-pink-600/10 text-pink-400 border border-pink-500/20 shadow-pink-900/40' :
                h.multiplier >= 2 ? 'bg-purple-600/10 text-purple-400 border border-purple-500/20 shadow-purple-900/40' :
                'bg-blue-600/10 text-[#5d87e6] border border-[#5d87e6]/20'
              }`}
            >
              {h.multiplier.toFixed(2)}x
            </div>
          ))
        ) : (
          <div className="text-gray-600 font-bold uppercase text-[9px] tracking-widest px-2">No history yet</div>
        )}
      </div>
      
      <div className="flex items-center gap-2 ml-4 px-2 border-l border-white/10">
        <button className="text-gray-500 hover:text-white transition-colors">
            <History size={16} />
        </button>
        <button className="text-gray-500 hover:text-white transition-colors">
            <ChevronDown size={18} />
        </button>
      </div>
    </div>
  );
};

export default AviatorHistory;
