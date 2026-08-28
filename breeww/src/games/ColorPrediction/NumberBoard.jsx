import React from 'react';
import { getNumberColorClass } from '../../utils/gameHelpers';

const NumberBoard = ({ selectedBet, onSelectBet, disabled }) => {
  const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div className="grid grid-cols-5 gap-2">
      {numbers.map(num => (
        <button
          key={num}
          disabled={disabled}
          onClick={() => onSelectBet({ type: 'number', value: num })}
          className={`aspect-square rounded-full border-2 flex items-center justify-center font-black text-lg transition-all transform active:scale-90 ${
            getNumberColorClass(num)
          } ${selectedBet?.type === 'number' && selectedBet?.value === num ? 'bg-white/20 scale-110 border-white shadow-lg' : 'bg-transparent'}`}
        >
          {num}
        </button>
      ))}
    </div>
  );
};

export default NumberBoard;
