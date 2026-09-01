import { useEffect, useRef, useState, useCallback } from 'react';

export function useAviatorWebSocket({
  onFlightTick,
  onPhaseChange,
  onNewBet,
  onNewCashout,
  onMyBetConfirmed,
  onMyCashoutConfirmed,
}) {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const pingIntervalRef = useRef(null);

  const connect = useCallback(() => {
    try {
      const token = localStorage.getItem('player_token') || '';
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsHost = window.location.hostname === 'localhost' ? 'localhost:3000' : window.location.host;
      const baseWs = (import.meta.env.VITE_WS_URL || `${wsProtocol}//${wsHost}/ws`).replace(/\/$/, '');
      const wsUrl = `${baseWs}${token ? `${baseWs.includes('?') ? '&' : '?'}token=${encodeURIComponent(token)}` : ''}`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        if (token) {
          ws.send(JSON.stringify({ action: 'auth', token }));
        }
        ws.send(JSON.stringify({ action: 'subscribe', gameId: 'aviator' }));

        // Heartbeat
        clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ action: 'ping' }));
          }
        }, 20000);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          switch (msg.type) {
            case 'AVIATOR_FLIGHT_TICK':
              if (onFlightTick) onFlightTick(msg);
              break;
            case 'ROUND_PHASE':
              if (onPhaseChange) onPhaseChange(msg);
              break;
            case 'NEW_BET':
              if (onNewBet) onNewBet(msg.bet);
              break;
            case 'NEW_CASHOUT':
              if (onNewCashout) onNewCashout(msg.bet);
              break;
            case 'MY_BET_CONFIRMED':
              if (onMyBetConfirmed) onMyBetConfirmed(msg);
              break;
            case 'MY_CASHOUT_CONFIRMED':
              if (onMyCashoutConfirmed) onMyCashoutConfirmed(msg);
              break;
            default:
              break;
          }
        } catch {
          // Ignore malformed message
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        clearInterval(pingIntervalRef.current);
        reconnectTimeoutRef.current = setTimeout(connect, 2000);
      };

      ws.onerror = () => {
        ws.close();
      };
    } catch {
      reconnectTimeoutRef.current = setTimeout(connect, 2000);
    }
  }, [onFlightTick, onPhaseChange, onNewBet, onNewCashout, onMyBetConfirmed, onMyCashoutConfirmed]);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectTimeoutRef.current);
      clearInterval(pingIntervalRef.current);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return { isConnected };
}
