import React from 'react';
import Tile from './Tile';

const MineGrid = ({ tiles, onTileClick, gameStatus }) => (
  <div className="mx-auto w-full max-w-[440px] p-4 rounded-3xl game-glass border border-white/10 bg-[#0c1424]/80 backdrop-blur-lg shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_10px_40px_rgba(0,0,0,0.5)]">
    <div className="grid grid-cols-5 gap-2.5 sm:gap-3">
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
