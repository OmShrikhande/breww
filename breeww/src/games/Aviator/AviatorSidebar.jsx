import React, { useState } from 'react';

const TABS = [
  { id: 'all', label: 'All Bets' },
  { id: 'my', label: 'My Bets' },
  { id: 'top', label: 'Top' },
];

const AviatorSidebar = ({ allBets = [], myBets = [], topBets = [] }) => {
  const [activeTab, setActiveTab] = useState('all');

  const lists = { all: allBets, my: myBets, top: topBets };
  const visibleBets = lists[activeTab] || [];
  const emptyMessage =
    activeTab === 'my'
      ? 'No bet this round — place one before the timer ends'
      : activeTab === 'top'
        ? 'No big wins yet'
        : 'Waiting for bets this round…';

  return (
    <div className="bg-[#1c1c1e] flex flex-col h-full w-full overflow-hidden shadow-2xl min-h-[200px]">
      <div className="flex bg-[#0a0a0a] rounded-full p-1 m-2 border border-white/5 shrink-0">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-1.5 px-2 rounded-full text-[10px] font-bold uppercase transition-all ${
              activeTab === tab.id ? 'bg-[#444446] text-white shadow-lg' : 'text-gray-500 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="px-4 py-2 border-b border-white/5 flex items-center justify-between shrink-0">
        <span className="text-white text-[11px] font-black uppercase tracking-tight">
          {TABS.find((t) => t.id === activeTab)?.label}
        </span>
        <span className="text-gray-400 text-[11px] font-black tabular-nums">{visibleBets.length}</span>
      </div>

      <div className="flex text-[8px] font-black text-gray-500 uppercase tracking-widest px-4 py-2 bg-black/40 shrink-0">
        <div className="flex-[1.5]">User</div>
        <div className="flex-1 text-center">Bet INR</div>
        <div className="flex-1 text-center">X</div>
        <div className="flex-1 text-right">Cash out INR</div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/20 min-h-[120px]">
        {visibleBets.length === 0 ? (
          <p className="text-center text-gray-500 text-[11px] font-bold py-8 px-4">{emptyMessage}</p>
        ) : (
          visibleBets.map((bet, i) => (
            <div
              key={bet.id ?? i}
              className={`flex items-center text-[10px] font-bold px-4 py-1.5 border-b border-white/5 ${
                bet.hasCashedOut ? 'bg-[#152e1b]/40' : bet.isMe ? 'bg-[#1b2a4d]/50' : 'bg-transparent'
              }`}
            >
              <div className="flex-[1.5] flex items-center gap-2 overflow-hidden">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#444446] to-[#1c1c1e] flex items-center justify-center text-[8px] font-black text-white shrink-0">
                  {(bet.user || '?')[0].toUpperCase()}
                </div>
                <span className={`truncate tracking-tight ${bet.isMe ? 'text-emerald-300' : 'text-gray-400'}`}>
                  {bet.isMe ? 'You' : bet.user}
                </span>
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

              <div className={`flex-1 text-right font-bold tabular-nums ${bet.hasCashedOut ? 'text-green-400' : 'text-gray-700'}`}>
                {bet.hasCashedOut
                  ? (bet.payout ?? bet.amount * bet.cashoutMult).toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  : '-'}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="px-4 py-2 border-t border-white/5 bg-black text-[9px] font-black text-gray-500 uppercase flex items-center gap-2 shrink-0">
        <div className="w-2 h-2 rounded-full border border-green-500 flex items-center justify-center">
          <div className="w-1 h-1 bg-green-500 rounded-full" />
        </div>
        <span>Live room</span>
      </div>
    </div>
  );
};

export default AviatorSidebar;
