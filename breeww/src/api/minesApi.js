import { apiClient } from '../lib/apiClient';

export const getActiveMinesSession = async () => {
  const res = await apiClient('/mines/active');
  return res.data;
};

export const startMinesGame = async (arg1, arg2) => {
  const amount = typeof arg1 === 'object' && arg1 !== null ? arg1.amount : arg1;
  const mineCount = typeof arg1 === 'object' && arg1 !== null ? arg1.mineCount : arg2;
  const res = await apiClient('/mines/start', {
    method: 'POST',
    body: { amount: Number(amount), mineCount: Number(mineCount ?? 3) },
  });
  return res.data;
};

export const revealMinesTile = async (arg1, arg2) => {
  const sessionId = typeof arg1 === 'object' && arg1 !== null ? arg1.sessionId : arg1;
  const tileIndex = typeof arg1 === 'object' && arg1 !== null ? arg1.tileIndex : arg2;
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
