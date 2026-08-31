import React, { useState } from 'react';
import { getColorClass } from '../../utils/gameHelpers';
import { formatINR } from '../../utils/formatCurrency';

const HistoryTable = ({ history = [], myBets = [] }) => {
  const [activeTab, setActiveTab] = useState('record');

  return (
    <div className="game-glass rounded-2xl border border-white/10 overflow-hidden mt-3 shadow-xl select-none">
      {/* Tab Switcher Header */}
      <div className="flex border-b border-white/10 bg-black/30 p-1 gap-1">
        <button
          type="button"
          onClick={() => setActiveTab('record')}
          className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'record' ? 'bg-white/15 text-white shadow-sm' : 'text-white/40 hover:text-white/70'
          }`}
        >
          Game Record
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('my_bets')}
          className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'my_bets' ? 'bg-white/15 text-white shadow-sm' : 'text-white/40 hover:text-white/70'
          }`}
        >
          My Bets {myBets.length > 0 && `(${myBets.length})`}
        </button>
      </div>

      {activeTab === 'record' ? (
        /* Tab 1: Game Record */
        <div className="overflow-x-auto max-h-56 custom-scrollbar">
          <table className="w-full text-center text-xs">
            <thead>
              <tr className="text-white/40 font-bold bg-black/40 text-[10px] uppercase tracking-wider sticky top-0 backdrop-blur-md">
                <th className="p-2.5">Period</th>
                <th className="p-2.5">Number</th>
                <th className="p-2.5">Big / Small</th>
                <th className="p-2.5">Colour</th>
              </tr>
            </thead>
            <tbody>
              {history.length > 0 ? (
                history.map((h, i) => (
                  <tr key={h.period || i} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-2.5 font-mono text-white/50 text-[11px]">#{h.period}</td>
                    <td className="p-2.5">
                      {typeof h.number === 'number' ? (
                        <span className={`inline-flex w-7 h-7 rounded-full items-center justify-center text-xs font-black text-white shadow-md ${getColorClass(h.color)}`}>
                          {h.number}
                        </span>
                      ) : (
                        <span className="font-black text-white">{h.raw || '—'}</span>
                      )}
                    </td>
                    <td className="p-2.5">
                      <span className={`text-[11px] font-bold ${h.size === 'Big' ? 'text-amber-400' : h.size === 'Small' ? 'text-sky-400' : 'text-white/40'}`}>
                        {h.size !== '—' ? h.size : '—'}
                      </span>
                    </td>
                    <td className="p-2.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                        h.color === 'Green'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : h.color === 'Red'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : h.color === 'Violet'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : 'bg-white/10 text-white/60'
                      }`}>
                        {h.color || '—'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="p-8 text-white/30 italic text-sm">No recent rounds recorded</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Tab 2: My Bets */
        <div className="overflow-x-auto max-h-56 custom-scrollbar">
          <table className="w-full text-center text-xs">
            <thead>
              <tr className="text-white/40 font-bold bg-black/40 text-[10px] uppercase tracking-wider sticky top-0 backdrop-blur-md">
                <th className="p-2.5">Round</th>
                <th className="p-2.5">Selection</th>
                <th className="p-2.5">Stake</th>
                <th className="p-2.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {myBets.length > 0 ? (
                myBets.map((b, i) => (
                  <tr key={b.id || i} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-2.5 font-mono text-white/50 text-[11px]">#{b.roundId}</td>
                    <td className="p-2.5 font-black uppercase text-white tracking-wide">{b.option || b.label}</td>
                    <td className="p-2.5 font-mono font-bold text-amber-300">{formatINR(b.amount)}</td>
                    <td className="p-2.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                        b.status === 'won'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : b.status === 'lost'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                      }`}>
                        {b.status === 'won' ? `+${formatINR(b.payout)}` : b.status === 'lost' ? 'Lost' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="p-8 text-white/30 italic text-sm">You haven't placed any bets yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default HistoryTable;
