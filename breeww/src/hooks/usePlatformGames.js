import { useCallback, useEffect, useState } from 'react';
import { fetchPlatformGames } from '../api/gamesApi';

export function usePlatformGames() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await fetchPlatformGames();
      setGames(
        list.map((g) => ({
          id: g.id,
          name: g.name,
          category: g.category,
          icon: g.icon,
          tagline: g.tagline,
          path: g.path,
          accentColor: g.accentColor,
          gradient: g.gradient,
          roundDriven: g.roundDriven,
          minBet: g.minBet,
          maxBet: g.maxBet,
        }))
      );
      setError(null);
    } catch (e) {
      setError(e.message || 'Could not load games');
      setGames([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { games, loading, error, reload: load };
}
