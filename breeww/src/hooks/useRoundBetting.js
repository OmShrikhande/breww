import { useCallback, useState } from 'react';
import { placeRoundBet } from '../api/gamesApi';
import { betToOptionId } from './useGameRound';
import { useAuth } from '../context/AuthContext';
import { useWallet } from './useWallet';
import { navigateTo } from '../lib/navigation';

export function useRoundBetting(gameId) {
  const { isAuthenticated } = useAuth();
  const { balance, refreshBalance } = useWallet();
  const [betError, setBetError] = useState('');
  const [betSuccess, setBetSuccess] = useState(false);
  const [placing, setPlacing] = useState(false);

  const placeBet = useCallback(async (bet, amount, { bettingOpen = true } = {}) => {
    if (!isAuthenticated) {
      navigateTo('/login');
      return false;
    }
    if (!bet) {
      setBetError('Please select an option before placing your stake.');
      return false;
    }
    if (!amount || amount <= 0) {
      setBetError('Please enter a valid bet amount (Min ₹10).');
      return false;
    }
    if (amount > balance) {
      setBetError('Insufficient balance. Please deposit to continue.');
      return false;
    }
    if (!bettingOpen) {
      setBetError('Betting window closed for this round. Next round starting shortly…');
      return false;
    }

    setBetError('');
    setPlacing(true);
    try {
      const optionId = betToOptionId(bet);
      await placeRoundBet(gameId, { optionId, amount });
      await refreshBalance();
      setBetSuccess(true);
      setTimeout(() => setBetSuccess(false), 2400);
      return true;
    } catch (e) {
      setBetError(e.message || 'Bet failed. Please try again.');
      return false;
    } finally {
      setPlacing(false);
    }
  }, [gameId, isAuthenticated, balance, refreshBalance]);

  const placeMultipleBets = useCallback(async (bets, amount, { bettingOpen = true } = {}) => {
    if (!bets?.length) {
      setBetError('Please select at least one option.');
      return false;
    }
    if (!isAuthenticated) {
      navigateTo('/login');
      return false;
    }
    if (!amount || amount <= 0) {
      setBetError('Please enter a valid bet amount.');
      return false;
    }
    if (!bettingOpen) {
      setBetError('Betting window closed for this round. Next round starting shortly…');
      return false;
    }

    setBetError('');
    setPlacing(true);
    try {
      for (const bet of bets) {
        await placeRoundBet(gameId, { optionId: betToOptionId(bet), amount });
      }
      await refreshBalance();
      setBetSuccess(true);
      setTimeout(() => setBetSuccess(false), 2400);
      return true;
    } catch (e) {
      setBetError(e.message || 'Bet failed. Please try again.');
      return false;
    } finally {
      setPlacing(false);
    }
  }, [gameId, isAuthenticated, refreshBalance]);

  return { placeBet, placeMultipleBets, betError, betSuccess, placing, clearError: () => setBetError('') };
}
