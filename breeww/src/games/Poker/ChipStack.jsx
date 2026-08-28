import React from 'react';
import { formatINR } from '../../utils/formatCurrency';

const chipColors = [
  'from-rose-500 to-rose-700',
  'from-sky-400 to-sky-700',
  'from-amber-300 to-amber-600',
  'from-violet-400 to-violet-700',
];

const ChipStack = ({ amount, label = 'Pot', compact = false }) => {
  const layers = compact ? 3 : 5;

  return (
    <div className={`flex items-center gap-3 rounded-2xl border border-white/10 bg-black/25 px-3 py-2 backdrop-blur-xl ${compact ? 'min-w-[120px]' : 'min-w-[160px]'}`}>
      <div className="relative h-10 w-12 shrink-0">
        {Array.from({ length: layers }).map((_, index) => (
          <div
            key={index}
            className={`absolute left-0 right-0 mx-auto h-4 rounded-full border border-white/20 bg-gradient-to-b ${chipColors[index % chipColors.length]} shadow-[0_6px_18px_rgba(0,0,0,0.35)]`}
            style={{ bottom: `${index * 5}px`, width: `${compact ? 28 : 34}px` }}
          >
            <div className="absolute inset-[3px] rounded-full border border-white/30" />
          </div>
        ))}
      </div>
      <div>
        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-100/60">{label}</div>
        <div className={`font-black text-white ${compact ? 'text-sm' : 'text-lg'}`}>{formatINR(amount)}</div>
      </div>
    </div>
  );
};

export default ChipStack;
