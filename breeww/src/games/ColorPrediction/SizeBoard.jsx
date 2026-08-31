import React from 'react';

const SizeBoard = ({ selectedBet, onSelectBet, disabled }) => {
  const sizes = [
    { value: 'Big', bg: 'from-orange-500 to-amber-700', mult: '2×' },
    { value: 'Small', bg: 'from-sky-500 to-blue-700', mult: '2×' },
  ];

  return (
    <div className="select-none">
      <div className="grid grid-cols-2 gap-2">
        {sizes.map(({ value, bg, mult }) => {
          const selected = selectedBet?.type === 'size' && selectedBet?.value === value;
          return (
            <button
              key={value}
              type="button"
              disabled={disabled}
              onClick={() => onSelectBet({ type: 'size', value })}
              className={`bet-chip py-3.5 sm:py-4 rounded-xl text-sm font-black uppercase tracking-widest text-white bg-gradient-to-br ${bg} border border-white/10 cursor-pointer ${
                selected ? 'ring-2 ring-casino-gold scale-[1.02]' : ''
              } ${disabled ? 'bet-chip--disabled' : ''}`}
            >
              {value}
              <span className="block text-[9px] sm:text-[10px] opacity-70 mt-0.5">{mult}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SizeBoard;
