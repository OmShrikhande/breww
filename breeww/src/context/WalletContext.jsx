import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getBalance, updateBalance } from '../api/walletApi';

const WalletContext = createContext();

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export const WalletProvider = ({ children }) => {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  const refreshBalance = useCallback(async () => {
    try {
      if (!localStorage.getItem('player_token')) {
        setBalance(0);
        return 0;
      }
      const next = await getBalance();
      setBalance(next);
      return next;
    } catch {
      return balance;
    } finally {
      setLoading(false);
    }
  }, [balance]);

  useEffect(() => {
    refreshBalance();
  }, []);

  const placeBet = async (amount) => {
    if (balance < amount) return false;
    try {
      const res = await updateBalance(-Math.abs(amount), 'bet', 'client placeBet');
      setBalance(res.newBalance);
      return true;
    } catch {
      return false;
    }
  };

  const addWin = async (amount) => {
    const value = Number(amount) || 0;
    if (value <= 0) return;
    try {
      const res = await updateBalance(value, 'win', 'client addWin');
      setBalance(res.newBalance);
    } catch {
      setBalance((prev) => prev + value);
    }
  };

  const deductLoss = async (amount) => {
    const value = Number(amount) || 0;
    if (value <= 0) return;
    try {
      const res = await updateBalance(-Math.abs(value), 'bet', 'client deductLoss');
      setBalance(res.newBalance);
    } catch {
      setBalance((prev) => prev - value);
    }
  };

  return (
    <WalletContext.Provider value={{ balance, loading, placeBet, addWin, deductLoss, refreshBalance, setBalance }}>
      {children}
    </WalletContext.Provider>
  );
};
