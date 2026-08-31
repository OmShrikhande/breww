import { apiClient } from '../lib/apiClient';

export const getAviatorState = async () => {
  const token = localStorage.getItem('player_token');
  const res = await apiClient('/aviator/state', { auth: Boolean(token) });
  return res.data;
};

export const placeAviatorBet = async (amount) => {
  const res = await apiClient('/aviator/bet', {
    method: 'POST',
    body: { amount },
  });
  return res.data;
};

export const cashoutAviator = async (roundId, multiplier) => {
  const res = await apiClient('/aviator/cashout', {
    method: 'POST',
    body: { roundId, multiplier },
  });
  return res.data;
};
