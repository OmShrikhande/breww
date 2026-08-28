import React from 'react';
import { getColorClass } from '../../utils/gameHelpers';

const SizeBoard = ({ selectedBet, onSelectBet, disabled }) => {
  const sizes = ['Big', 'Small'];

  return (
    <div className="grid grid-cols-2 gap-4">
      {sizes.map(size => (
        <button
          key={size}
          disabled={disabled}
          onClick={() => onSelectBet({ type: 'size', value: size })}
          className={`py-6 rounded-xl font-black text-lg uppercase tracking-widest transition-all transform active:scale-95 ${
            getColorClass(size)
          } ${selectedBet?.type === 'size' && selectedBet?.value === size ? 'ring-4 ring-white scale-105 shadow-2xl' : 'opacity-80'}`}
        >
          {size}
        </button>
      ))}
    </div>
  );
};

export default SizeBoard;
