import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchRoundHistory, fetchRoundState } from '../api/gamesApi';
import { useWebSocket } from '../context/WebSocketContext';

export function useGameRound(gameId, { pollMs = 3000 } = {}) {
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
export function parseDiceResult(result) {
  const r = String(result || '').toLowerCase();
  const makeDice = (sum) => {
    const s = Math.min(18, Math.max(3, sum));
    const d1 = Math.min(6, Math.max(1, Math.floor(s / 3)));
    const d2 = Math.min(6, Math.max(1, Math.floor((s - d1) / 2)));
    const d3 = Math.min(6, Math.max(1, s - d1 - d2));
    return [d1, d2, d3];
  };

  const direct = parseInt(r, 10);
  if (Number.isFinite(direct) && direct >= 3 && direct <= 18) {
    const dice = makeDice(direct);
    const sum = dice.reduce((a, b) => a + b, 0);
    return {
      dice,
      sum,
      size: sum >= 11 ? 'Big' : 'Small',
      parity: sum % 2 === 0 ? 'Even' : 'Odd',
      label: String(sum),
    };
  }

  const hash = r.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const fallback = [(hash % 6) + 1, ((hash * 2) % 6) + 1, ((hash * 3) % 6) + 1];
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
