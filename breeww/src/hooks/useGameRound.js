import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchRoundHistory, fetchRoundState } from '../api/gamesApi';

export function useGameRound(gameId, { pollMs = 1000 } = {}) {
  const [round, setRound] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const lastResultRef = useRef(null);

  const refresh = useCallback(async () => {
    try {
      const [state, hist] = await Promise.all([
        fetchRoundState(gameId),
        fetchRoundHistory(gameId, 12),
      ]);
      setRound(state);
      setHistory(hist);
      if (state?.result && state.result !== lastResultRef.current) {
        lastResultRef.current = state.result;
      }
    } catch {
      /* keep last state */
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, pollMs);
    return () => clearInterval(t);
  }, [refresh, pollMs]);

  return {
    round,
    history,
    loading,
    refresh,
    timerLeft: round?.timerLeft ?? 0,
    bettingOpen: Boolean(round?.bettingOpen),
    result: round?.result ?? null,
    roundId: round?.roundId ?? null,
  };
}

export function betToOptionId(bet) {
  if (!bet) return '';
  if (bet.type === 'color') return String(bet.value).toLowerCase();
  if (bet.type === 'size') return String(bet.value).toLowerCase();
  if (bet.type === 'number') return String(bet.value);
  if (bet.type === 'sum') return String(bet.value);
  if (bet.type === 'parity') return String(bet.value).toLowerCase();
  if (bet.type === 'side') return String(bet.value).toLowerCase();
  return String(bet.value).toLowerCase();
}

/** Build three dice + metadata from round result string */
export function parseDiceResult(result) {
  const r = String(result || '').toLowerCase();
  const makeDice = (sum) => {
    let a = Math.min(6, Math.max(1, Math.floor(sum / 3)));
    let b = Math.min(6, Math.max(1, Math.floor((sum - a) / 2)));
    let c = Math.min(6, Math.max(1, sum - a - b));
    while (a + b + c !== sum) {
      c = Math.min(6, Math.max(1, sum - a - b));
      if (a + b + c === sum) break;
      a = Math.max(1, a - 1);
    }
    return [a, b, c];
  };

  if (/^\d+$/.test(r)) {
    const n = Number(r);
    if (n >= 1 && n <= 6) {
      return { dice: [n, n, n], sum: n * 3, size: n * 3 >= 11 ? 'Big' : 'Small', parity: (n * 3) % 2 === 0 ? 'Even' : 'Odd', label: r };
    }
    if (n >= 3 && n <= 18) {
      const dice = makeDice(n);
      const sum = dice.reduce((x, y) => x + y, 0);
      return { dice, sum, size: sum >= 11 ? 'Big' : 'Small', parity: sum % 2 === 0 ? 'Even' : 'Odd', label: r };
    }
  }
  if (r === 'big') {
    const dice = makeDice(12);
    return { dice, sum: 12, size: 'Big', parity: 'Even', label: 'big' };
  }
  if (r === 'small') {
    const dice = makeDice(9);
    return { dice, sum: 9, size: 'Small', parity: 'Odd', label: 'small' };
  }
  if (r === 'even') {
    const dice = makeDice(10);
    return { dice, sum: 10, size: 'Small', parity: 'Even', label: 'even' };
  }
  if (r === 'odd') {
    const dice = makeDice(11);
    return { dice, sum: 11, size: 'Big', parity: 'Odd', label: 'odd' };
  }
  const fallback = makeDice(10);
  return { dice: fallback, sum: 10, size: 'Small', parity: 'Even', label: r };
}

/** Deterministic cards for dragon/tiger/tie from round id + result */
export function parseDragonTigerResult(result, roundId = 0) {
  const winner = String(result || 'tie').toLowerCase();
  const seed = Number(roundId) || Date.now();
  const suits = ['♠', '♣', '♥', '♦'];
  const suit = (i) => suits[(seed + i) % 4];
  let dragonVal = (seed % 11) + 3;
  let tigerVal = ((seed * 7) % 11) + 3;

  if (winner === 'dragon' && dragonVal <= tigerVal) dragonVal = Math.min(13, tigerVal + 1 + (seed % 3));
  if (winner === 'tiger' && tigerVal <= dragonVal) tigerVal = Math.min(13, dragonVal + 1 + (seed % 3));
  if (winner === 'tie') tigerVal = dragonVal;

  return {
    dragon: { value: dragonVal, suit: suit(0) },
    tiger: { value: tigerVal, suit: suit(1) },
    winner,
  };
}
