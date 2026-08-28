import React from 'react';
import { getColorClass } from '../../utils/gameHelpers';

const ColorBoard = ({ selectedBet, onSelectBet, disabled }) => {
  const colors = ['Green', 'Violet', 'Red'];

  return (
    <div className="grid grid-cols-3 gap-3">
      {colors.map(color => (
        <button
          key={color}
          disabled={disabled}
          onClick={() => onSelectBet({ type: 'color', value: color })}
          className={`relative py-4 rounded-xl font-black text-sm uppercase tracking-wider transition-all transform active:scale-95 ${
            getColorClass(color)
          } ${selectedBet?.type === 'color' && selectedBet?.value === color ? 'ring-4 ring-white scale-105 shadow-2xl' : 'opacity-80'}`}
        >
          {color}
          {selectedBet?.type === 'color' && selectedBet?.value === color && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full shadow-lg"></div>
          )}
        </button>
      ))}
    </div>
  );
};

export default ColorBoard;
