import React from 'react';
import { Clock3 } from 'lucide-react';
import { formatINR } from '../../utils/formatCurrency';

const PokerHistory = ({ entries = [] }) => {
  return (
    <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,18,32,0.96),rgba(5,10,20,0.9))] p-4 text-white shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.36em] text-emerald-100/60">Table Feed</div>
          <h3 className="mt-1 text-lg font-black">Action History</h3>
        </div>
        <div className="rounded-full border border-white/10 bg-white/5 p-2 text-emerald-100/70">
          <Clock3 size={16} />
        </div>
      </div>

      <div className="mt-4 space-y-2.5">
        {entries.map((entry) => (
          <div key={entry.id} className="rounded-2xl border border-white/8 bg-white/[0.04] px-3 py-2.5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-bold text-white">{entry.player}</div>
                <div className="text-xs text-white/55">{entry.time}</div>
              </div>
              <div className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.24em] ${entry.accentClass}`}>
                {entry.action}
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between gap-2 text-sm">
              <span className="text-white/65">{entry.detail}</span>
              {typeof entry.amount === 'number' && (
                <span className="font-black text-amber-200">{formatINR(entry.amount)}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PokerHistory;
