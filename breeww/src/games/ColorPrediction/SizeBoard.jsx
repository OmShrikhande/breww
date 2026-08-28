import React from 'react';

const SizeBoard = ({ selectedBet, onSelectBet, disabled }) => {
  const sizes = [
    { value: 'Big', bg: 'from-orange-500 to-amber-700', mult: '2×' },
    { value: 'Small', bg: 'from-sky-500 to-blue-700', mult: '2×' },
  ];

  return (
    <div>
      <p className="game-section-title">Big or small</p>
      <div className="grid grid-cols-2 gap-3">
        {sizes.map(({ value, bg, mult }) => {
          const selected = selectedBet?.type === 'size' && selectedBet?.value === value;
          return (
            <button
              key={value}
              type="button"
              disabled={disabled}
              onClick={() => onSelectBet({ type: 'size', value })}
              className={`bet-chip py-6 rounded-2xl text-base font-black uppercase tracking-widest text-white bg-gradient-to-br ${bg} border border-white/10 ${
                selected ? 'ring-2 ring-casino-gold scale-[1.02]' : ''
              } ${disabled ? 'bet-chip--disabled' : ''}`}
            >
              {value}
              <span className="block text-[10px] opacity-70 mt-1">{mult}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SizeBoard;
