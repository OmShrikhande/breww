import { apiClient } from '../lib/apiClient';

export const getActiveMinesSession = async () => {
  const res = await apiClient('/mines/active');
  return res.data;
};

export const startMinesGame = async ({ amount, mineCount }) => {
  const res = await apiClient('/mines/start', {
    method: 'POST',
    body: { amount: Number(amount), mineCount: Number(mineCount) },
  });
  return res.data;
};

export const revealMinesTile = async ({ sessionId, tileIndex }) => {
  const res = await apiClient('/mines/reveal', {
    method: 'POST',
    body: { sessionId: Number(sessionId), tileIndex: Number(tileIndex) },
  });
  return res.data;
};

export const cashoutMines = async (sessionId) => {
  const res = await apiClient('/mines/cashout', {
    method: 'POST',
    body: { sessionId: Number(sessionId) },
  });
  return res.data;
};

export const abandonMinesGame = async () => {
  const res = await apiClient('/mines/abandon', { method: 'POST' });
  return res.data;
};
