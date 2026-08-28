import React from 'react';
import { getColorClass } from '../../utils/gameHelpers';

const HistoryTable = ({ history = [] }) => (
  <div className="game-glass rounded-2xl border border-white/10 overflow-hidden mt-2">
    <div className="px-4 py-3 border-b border-white/10">
      <h3 className="text-xs font-black uppercase tracking-widest text-white/50">Recent rounds</h3>
    </div>
    <div className="overflow-x-auto max-h-48">
      <table className="w-full text-center text-xs">
        <thead>
          <tr className="text-white/35 font-bold bg-black/20 text-[10px] uppercase tracking-wider">
            <th className="p-2.5">Round</th>
            <th className="p-2.5">Result</th>
            <th className="p-2.5">Detail</th>
          </tr>
        </thead>
        <tbody>
          {history.length > 0 ? (
            history.map((h, i) => (
              <tr key={h.period || i} className="border-t border-white/5 hover:bg-white/5">
                <td className="p-2.5 font-mono text-white/40 text-[10px]">#{h.period}</td>
                <td className="p-2.5 font-black text-white uppercase">{h.raw || h.color || h.number}</td>
                <td className="p-2.5">
                  {typeof h.number === 'number' ? (
                    <span className={`inline-flex w-7 h-7 rounded-full items-center justify-center text-[11px] font-black text-white ${getColorClass(h.color)}`}>
                      {h.number}
                    </span>
                  ) : (
                    <span className="text-white/40 text-[10px]">{h.size !== '—' ? h.size : h.color}</span>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="p-6 text-white/30 italic text-sm">No rounds yet</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

export default HistoryTable;
