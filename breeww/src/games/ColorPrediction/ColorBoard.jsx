import React from 'react';

const COLORS = [
  { value: 'Green', bg: 'from-emerald-600 to-emerald-800', ring: 'ring-emerald-400' },
  { value: 'Violet', bg: 'from-violet-600 to-purple-800', ring: 'ring-violet-400' },
  { value: 'Red', bg: 'from-rose-600 to-red-800', ring: 'ring-rose-400' },
];

const ColorBoard = ({ selectedBet, onSelectBet, disabled }) => (
  <div>
    <p className="game-section-title">Pick a colour</p>
    <div className="grid grid-cols-3 gap-3">
      {COLORS.map(({ value, bg, ring }) => {
        const selected = selectedBet?.type === 'color' && selectedBet?.value === value;
        return (
          <button
            key={value}
            type="button"
            disabled={disabled}
            onClick={() => onSelectBet({ type: 'color', value })}
            className={`bet-chip py-5 rounded-2xl text-sm font-black uppercase tracking-wider text-white bg-gradient-to-br ${bg} border border-white/10 shadow-lg ${
              selected ? `ring-2 ${ring} scale-[1.03]` : 'opacity-90 hover:opacity-100'
            } ${disabled ? 'bet-chip--disabled' : ''}`}
          >
            {value}
            <span className="block text-[10px] font-bold opacity-70 mt-1">2×</span>
          </button>
        );
      })}
    </div>
  </div>
);

export default ColorBoard;
