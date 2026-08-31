import React from 'react';

const COLORS = [
  { value: 'Green', bg: 'from-emerald-600 to-emerald-800', ring: 'ring-emerald-400', mult: '2×' },
  { value: 'Violet', bg: 'from-violet-600 to-purple-800', ring: 'ring-violet-400', mult: '4.5×' },
  { value: 'Red', bg: 'from-rose-600 to-red-800', ring: 'ring-rose-400', mult: '2×' },
];

const ColorBoard = ({ selectedBet, onSelectBet, disabled }) => (
  <div className="select-none">
    <div className="grid grid-cols-3 gap-2">
      {COLORS.map(({ value, bg, ring, mult }) => {
        const selected = selectedBet?.type === 'color' && selectedBet?.value === value;
        return (
          <button
            key={value}
            type="button"
            disabled={disabled}
            onClick={() => onSelectBet({ type: 'color', value })}
            className={`bet-chip py-3 sm:py-4 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider text-white bg-gradient-to-br ${bg} border border-white/10 shadow-lg cursor-pointer ${
              selected ? `ring-2 ${ring} scale-[1.03]` : 'opacity-90 hover:opacity-100'
            } ${disabled ? 'bet-chip--disabled' : ''}`}
          >
            {value}
            <span className="block text-[9px] sm:text-[10px] font-bold opacity-70 mt-0.5">{mult}</span>
          </button>
        );
      })}
    </div>
  </div>
);

export default ColorBoard;
