import React from 'react';
import Tile from './Tile';

const MineGrid = ({ tiles, onTileClick, gameStatus }) => (
  <div className="mx-auto w-full max-w-[420px] p-3 rounded-2xl game-glass border border-white/10">
    <div className="grid grid-cols-5 gap-2">
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

export default MineGrid;
