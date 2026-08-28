import React from 'react';
import Tile from './Tile';

const MineGrid = ({ tiles, onTileClick, gameStatus }) => {
  return (
    <div className="mx-auto w-full max-w-[480px] p-2 rounded-2xl bg-gradient-to-br from-[#0b3c94] to-[#174bb5] border border-blue-400/20 shadow-2xl">
      <div className="grid grid-cols-5 gap-2 p-2">
        {tiles.map((status, index) => (
          <Tile
            key={index}
            index={index}
            status={status}
            onClick={onTileClick}
            disabled={gameStatus !== 'playing'}
          />
        ))}
      </div>
    </div>
  );
};

export default MineGrid;
