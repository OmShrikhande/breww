import { useCallback, useState } from 'react';
import { placeRoundBet } from '../api/gamesApi';
import { betToOptionId } from './useGameRound';
import { useAuth } from '../context/AuthContext';
import { useWallet } from './useWallet';
import { navigateTo } from '../lib/navigation';

export function useRoundBetting(gameId) {
  const { isAuthenticated } = useAuth();
  const { refreshBalance } = useWallet();
  const [betError, setBetError] = useState('');
  const [betSuccess, setBetSuccess] = useState(false);
  const [placing, setPlacing] = useState(false);

  const placeBet = useCallback(async (bet, amount, { bettingOpen = true } = {}) => {
    if (!isAuthenticated) {
      navigateTo('/login');
      return false;
    }
    if (!bet || !amount || amount <= 0 || !bettingOpen) return false;

    setBetError('');
    setPlacing(true);
    try {
      await placeRoundBet(gameId, { optionId: betToOptionId(bet), amount });
      await refreshBalance();
      setBetSuccess(true);
      setTimeout(() => setBetSuccess(false), 2200);
      return true;
    } catch (e) {
      setBetError(e.message || 'Bet failed');
      return false;
    } finally {
      setPlacing(false);
    }
  }, [gameId, isAuthenticated, refreshBalance]);

  const placeMultipleBets = useCallback(async (bets, amount, opts) => {
    if (!bets?.length) return false;
    if (!isAuthenticated) {
      navigateTo('/login');
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
      setTimeout(() => setBetSuccess(false), 2200);
      return true;
    } catch (e) {
      setBetError(e.message || 'Bet failed');
      return false;
    } finally {
      setPlacing(false);
    }
  }, [gameId, isAuthenticated, refreshBalance]);

  return { placeBet, placeMultipleBets, betError, betSuccess, placing, clearError: () => setBetError('') };
}
