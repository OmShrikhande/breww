import React, { useState } from 'react';

const AviatorSidebar = ({ allBets }) => {
  const [activeTab, setActiveTab] = useState('all'); // all, my, top

  return (
    <div className="bg-[#1c1c1e] flex flex-col h-full w-full overflow-hidden shadow-2xl">
      {/* Tabs */}
      <div className="flex bg-[#0a0a0a] rounded-full p-1 m-2 border border-white/5 shrink-0">
        {['All Bets', 'My Bets', 'Top'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab.toLowerCase().split(' ')[0])}
            className={`flex-1 py-1.5 px-3 rounded-full text-[10px] font-bold uppercase transition-all ${
              activeTab === tab.toLowerCase().split(' ')[0] ? 'bg-[#444446] text-white shadow-lg' : 'text-gray-500 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Info Header */}
      <div className="px-4 py-2 border-b border-white/5 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-white text-[11px] font-black uppercase tracking-tight">All Bets</span>
          <span className="text-gray-400 text-[11px] font-black tabular-nums">{allBets.length}</span>
        </div>
      </div>

      {/* Column Labels */}
      <div className="flex text-[8px] font-black text-gray-500 uppercase tracking-widest px-4 py-2 bg-black/40">
        <div className="flex-[1.5]">User</div>
        <div className="flex-1 text-center">Bet INR</div>
        <div className="flex-1 text-center">X</div>
        <div className="flex-1 text-right">Cash out INR</div>
      </div>

      {/* Bets List */}
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-0.5 custom-scrollbar bg-black/20">
        {allBets.map((bet, i) => (
          <div 
            key={bet.id || i} 
            className={`flex items-center text-[10px] font-bold px-4 py-1.5 transition-all border-b border-white/5 ${
              bet.hasCashedOut ? 'bg-[#152e1b]/40' : 'bg-transparent'
            }`}
          >
            <div className="flex-[1.5] flex items-center gap-2 overflow-hidden">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#444446] to-[#1c1c1e] flex items-center justify-center text-[8px] font-black text-white shrink-0 shadow-inner">
                {bet.user[0].toUpperCase()}
              </div>
              <span className="text-gray-400 truncate tracking-tight">{bet.user}</span>
            </div>
            
            <div className="flex-1 text-center text-gray-300 font-bold tabular-nums">
              {bet.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            
            <div className="flex-1 text-center font-bold tabular-nums">
              {bet.hasCashedOut ? (
                <span className="bg-[#242e4d] text-[#5d87e6] px-1.5 py-0.5 rounded-full text-[8px] border border-[#5d87e6]/20">
                  {bet.cashoutMult.toFixed(2)}x
                </span>
              ) : (
                <span className="text-gray-700">-</span>
              )}
            </div>
            
            <div className={`flex-1 text-right font-bold tabular-nums ${
              bet.hasCashedOut ? 'text-green-400' : 'text-gray-700'
            }`}>
              {bet.hasCashedOut 
                ? (bet.amount * bet.cashoutMult).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) 
                : '-'
              }
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-white/5 bg-black text-[9px] font-black text-gray-500 uppercase flex items-center gap-2">
        <div className="w-2 h-2 rounded-full border border-green-500 flex items-center justify-center">
          <div className="w-1 h-1 bg-green-500 rounded-full" />
        </div>
        <span>This game is Provably Fair</span>
      </div>
    </div>
  );
};

export default AviatorSidebar;
