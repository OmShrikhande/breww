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

export const requestDeposit = async (amount, method = 'upi') => {
  const res = await apiClient('/wallet/deposit', {
    method: 'POST',
    body: { amount, method },
  });
  return res.data;
};

export const requestWithdraw = async (amount, method = 'upi') => {
  const res = await apiClient('/wallet/withdraw', {
    method: 'POST',
    body: { amount, method },
  });
  return res.data;
};

export const getWalletTransactions = async () => {
  const res = await apiClient('/wallet/transactions');
  return res.data || [];
};
