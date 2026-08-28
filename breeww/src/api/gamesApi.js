import { apiClient } from '../lib/apiClient';

export const fetchPlatformGames = async () => {
  const res = await apiClient('/games', { auth: false });
  return res.data || [];
};

export const fetchRoundState = async (gameId) => {
  const res = await apiClient(`/games/${gameId}/round`, { auth: false });
  return res.data;
};

export const fetchRoundHistory = async (gameId, limit = 20) => {
  const res = await apiClient(`/games/${gameId}/round/history?limit=${limit}`, { auth: false });
  return res.data || [];
};

export const placeRoundBet = async (gameId, { optionId, amount }) => {
  const res = await apiClient(`/games/${gameId}/round/bet`, {
    method: 'POST',
    body: { optionId, amount },
  });
  return res.data;
};
