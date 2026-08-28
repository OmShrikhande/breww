import React from 'react';
import { getNumberColorClass } from '../../utils/gameHelpers';

const NumberBoard = ({ selectedBet, onSelectBet, disabled }) => (
  <div>
    <p className="game-section-title">Exact number</p>
    <div className="grid grid-cols-5 gap-2">
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
        const selected = selectedBet?.type === 'number' && selectedBet?.value === num;
        return (
          <button
            key={num}
            type="button"
            disabled={disabled}
            onClick={() => onSelectBet({ type: 'number', value: num })}
            className={`bet-chip aspect-square rounded-xl border-2 flex flex-col items-center justify-center font-black text-lg ${getNumberColorClass(num)} ${
              selected ? 'ring-2 ring-casino-gold scale-110 border-casino-gold!' : ''
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
