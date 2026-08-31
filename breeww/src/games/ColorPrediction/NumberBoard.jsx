import React from 'react';
import { getNumberColorClass } from '../../utils/gameHelpers';

const NumberBoard = ({ selectedBet, onSelectBet, disabled }) => (
  <div className="select-none">
    <div className="grid grid-cols-5 gap-1.5">
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
        const selected = selectedBet?.type === 'number' && selectedBet?.value === num;
        return (
          <button
            key={num}
            type="button"
            disabled={disabled}
            onClick={() => onSelectBet({ type: 'number', value: num })}
            className={`bet-chip h-10 sm:h-12 rounded-xl border-2 flex flex-col items-center justify-center font-black text-sm sm:text-base cursor-pointer ${getNumberColorClass(num)} ${
              selected ? 'ring-2 ring-casino-gold scale-105 border-casino-gold!' : ''
            } ${disabled ? 'bet-chip--disabled' : ''}`}
          >
            {num}
          </button>
        );
      })}
    </div>
  </div>
);

export default NumberBoard;
