import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchRoundHistory, fetchRoundState } from '../api/gamesApi';
import { useWebSocket } from '../context/WebSocketContext';

export function useGameRound(gameId, { pollMs = 1500 } = {}) {
  const [round, setRound] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const lastResultRef = useRef(null);
  const { subscribeListener, send } = useWebSocket();

  const refresh = useCallback(async () => {
    try {
      const [state, hist] = await Promise.all([
        fetchRoundState(gameId),
        fetchRoundHistory(gameId, 12),
      ]);
      setRound((prev) => {
        if (!state) return prev;
        return {
          ...(prev || {}),
          ...state,
          timerLeft: Number.isFinite(state.secondsLeft) ? state.secondsLeft : (state.timerLeft ?? prev?.timerLeft ?? 0),
          bettingOpen: state.secondsLeft !== undefined ? state.secondsLeft > 5 : (state.bettingOpen ?? true),
        };
      });
      setHistory(hist || []);
      if (state?.result && state.result !== lastResultRef.current) {
        lastResultRef.current = state.result;
      }
    } catch {
      /* keep last state */
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  // Real-time continuous 1-second local timer clock (eliminates 3s gap)
  useEffect(() => {
    const clock = setInterval(() => {
      setRound((prev) => {
        if (!prev) return prev;
        const current = prev.timerLeft ?? 0;
        if (current <= 0) return prev;
        const next = current - 1;
        return {
          ...prev,
          timerLeft: next,
          bettingOpen: next > 5,
        };
      });
    }, 1000);

    return () => clearInterval(clock);
  }, []);

  // Real-time WebSocket game event listener
  useEffect(() => {
    send({ action: 'subscribe', gameId });

    const unsubscribe = subscribeListener((msg) => {
      if (msg.gameId && msg.gameId !== gameId) return;

      if (msg.type === 'ROUND_TICK') {
        setRound((prev) => ({
          ...(prev || {}),
          roundId: msg.roundId,
          timerLeft: msg.timerLeft,
          bettingOpen: msg.bettingOpen,
          status: 'open',
        }));
      } else if (msg.type === 'ROUND_RESULT') {
        setRound((prev) => ({
          ...(prev || {}),
          roundId: msg.roundId,
          result: msg.result,
          status: 'declared',
          bettingOpen: false,
          timerLeft: 0,
        }));
        // Refetch latest history instantly
        fetchRoundHistory(gameId, 12).then((hist) => setHistory(hist)).catch(() => {});
      } else if (msg.type === 'ROUND_START') {
        setRound((prev) => ({
          ...(prev || {}),
          roundId: msg.roundId,
          result: null,
          status: 'open',
          bettingOpen: true,
          timerLeft: msg.timerLeft,
        }));
      }
    });

    return unsubscribe;
  }, [gameId, subscribeListener, send]);

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
export function parseDiceResult(raw) {
  if (!raw) return { dice: [1, 2, 3], sum: 6, size: 'small', parity: 'even' };
  try {
    if (typeof raw === 'object' && Array.isArray(raw.dice)) return raw;
    const parts = String(raw).split(',').map((x) => parseInt(x.trim(), 10)).filter((n) => !Number.isNaN(n));
    if (parts.length >= 3) {
      const dice = parts.slice(0, 3);
      const sum = dice.reduce((a, b) => a + b, 0);
      return { dice, sum, size: sum >= 11 ? 'big' : 'small', parity: sum % 2 === 0 ? 'even' : 'odd' };
    }
  } catch {
    /* fallback */
  }
  return { dice: [3, 4, 5], sum: 12, size: 'big', parity: 'even' };
}

/** Parse Dragon Tiger card result */
export function parseDragonTigerResult(raw, roundId = 0) {
  if (!raw) return { dragon: 10, tiger: 7, winner: 'dragon' };
  try {
    const s = String(raw).toLowerCase();
    if (s.includes('dragon')) return { dragon: 13, tiger: 8, winner: 'dragon' };
    if (s.includes('tiger')) return { dragon: 6, tiger: 12, winner: 'tiger' };
    if (s.includes('tie')) return { dragon: 9, tiger: 9, winner: 'tie' };
    const parts = s.split(':');
    if (parts.length >= 2) {
      const d = parseInt(parts[0], 10) || 10;
      const t = parseInt(parts[1], 10) || 7;
      const winner = d > t ? 'dragon' : t > d ? 'tiger' : 'tie';
      return { dragon: d, tiger: t, winner };
    }
  } catch {
    /* fallback */
  }
  return { dragon: 11, tiger: 5, winner: 'dragon' };
}

/** Parse WinGo color prediction result */
export function parseColourResult(raw) {
  if (!raw) return { number: 5, color: 'green', size: 'big' };
  try {
    const num = parseInt(raw, 10);
    if (!Number.isNaN(num)) {
      const color = num === 0 ? 'violet-red' : num === 5 ? 'violet-green' : num % 2 === 0 ? 'red' : 'green';
      const size = num >= 5 ? 'big' : 'small';
      return { number: num, color, size };
    }
    const s = String(raw).toLowerCase();
    if (s.includes('red')) return { number: 2, color: 'red', size: 'small' };
    if (s.includes('green')) return { number: 7, color: 'green', size: 'big' };
    if (s.includes('violet')) return { number: 0, color: 'violet', size: 'small' };
  } catch {
    /* fallback */
  }
  return { number: 8, color: 'red', size: 'big' };
}
