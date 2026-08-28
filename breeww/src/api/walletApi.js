import { apiClient } from '../lib/apiClient';

export const getBalance = async () => {
  const res = await apiClient('/wallet/balance');
  return Number(res.data?.balance ?? 0);
};

export const updateBalance = async (amount, type = 'admin_adjust', note) => {
  const res = await apiClient('/wallet/adjust', {
    method: 'POST',
    body: { amount, type, note },
  });
  return { success: true, newBalance: Number(res.data?.balance ?? 0) };
};

export const getLedger = async () => {
  const res = await apiClient('/wallet/ledger');
  return res.data || [];
};
