import React from 'react';
import GameCard from '../games/GameCard';

const PlatformRecommendation = ({ games, loading, error, onRetry }) => {
  return (
    <div className="px-4 mb-8">
      <div className="flex justify-between items-end mb-4 px-1">
        <div>
          <h2 className="text-lg font-black text-white tracking-tight">Live Games</h2>
          <p className="text-[11px] text-white/40 mt-0.5">Synced from admin panel</p>
        </div>
      </div>

      {loading && (
        <div className="grid grid-cols-2 gap-3.5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 rounded-2xl bg-white/5 animate-pulse border border-white/5" />
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-center">
          <p className="text-sm text-red-300 mb-2">{error}</p>
          {onRetry && (
            <button type="button" onClick={onRetry} className="text-xs font-black uppercase text-white bg-white/10 px-4 py-2 rounded-lg">
              Retry
            </button>
          )}
        </div>
      )}

      {!loading && !error && games.length === 0 && (
        <p className="text-center text-sm text-white/40 py-8">No active games — enable games in admin</p>
      )}

      {!loading && games.length > 0 && (
        <div className="grid grid-cols-2 gap-3.5">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PlatformRecommendation;
