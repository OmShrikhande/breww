import React from 'react';
import { getColorClass } from '../../utils/gameHelpers';

const HistoryTable = ({ gameHistory }) => {
  return (
    <div className="bg-casino-card rounded-2xl border border-white/5 shadow-xl overflow-hidden mt-6">
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-widest">Game History</h3>
        <div className="flex bg-[#0B0F2A] rounded-lg p-0.5">
          <button className="px-3 py-1 text-[10px] font-bold rounded-md bg-orange-500/20 text-orange-400">Game history</button>
          <button className="px-3 py-1 text-[10px] font-bold rounded-md text-gray-500">Chart</button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-center text-xs">
          <thead>
            <tr className="text-gray-400 font-bold bg-black/20">
              <th className="p-3">Period</th>
              <th className="p-3">Number</th>
              <th className="p-3">Big Small</th>
              <th className="p-3">Color</th>
            </tr>
          </thead>
          <tbody>
            {gameHistory.length > 0 ? (
              gameHistory.map((h, i) => (
                <tr key={i} className="border-t border-white/5">
                  <td className="p-3 font-mono text-gray-400 text-[10px]">{h.period}</td>
                  <td className={`p-3 font-black text-lg ${h.color === 'Green' ? 'text-green-500' : h.color === 'Red' ? 'text-red-500' : 'text-purple-500'}`}>
                    {h.number}
                  </td>
                  <td className="p-3 font-bold text-gray-300 uppercase text-[10px]">{h.size}</td>
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-1">
                      {h.color === 'Violet' ? (
                        <>
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                          <div className="w-2.5 h-2.5 rounded-full bg-purple-500"></div>
                        </>
                      ) : (
                        <div className={`w-2.5 h-2.5 rounded-full ${getColorClass(h.color)}`}></div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="p-8 text-center text-gray-600 italic">No history yet...</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HistoryTable;
