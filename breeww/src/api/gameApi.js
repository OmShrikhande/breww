import { apiClient, apiBaseUrl } from '../lib/apiClient';

export const fetchGameHistory = async (gameId) => {
  const q = gameId ? `?gameId=${encodeURIComponent(gameId)}` : '';
  const res = await apiClient(`/games/history${q}`);
  return res.data || [];
};

export const submitBet = async (betData) => {
  const res = await apiClient('/games/bet', {
    method: 'POST',
    body: betData,
  });
  return res.data || { success: true };
};

export const submitRouletteBet = async (bets, { signal } = {}) => {
  const token = localStorage.getItem('player_token');
  const url = `${apiBaseUrl}/games/roulette/bet`;
  const response = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ bets }),
    signal,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Failed to submit roulette bet.');
  }
  return data.data || data;
};
