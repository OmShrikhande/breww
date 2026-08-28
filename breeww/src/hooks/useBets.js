import { useState, useCallback } from 'react';

export const useBets = () => {
  const [bets, setBets] = useState([]);

  const addBet = useCallback((bet) => {
    setBets(prev => [...prev, { ...bet, id: Date.now() }]);
  }, []);

  const clearBets = useCallback(() => {
    setBets([]);
  }, []);

  const totalBetAmount = bets.reduce((sum, bet) => sum + bet.amount, 0);

  return {
    bets,
    addBet,
    clearBets,
    totalBetAmount
  };
};
