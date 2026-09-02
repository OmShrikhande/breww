import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { useWallet } from '../hooks/useWallet';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const { setBalance } = useWallet();
  const wsRef = useRef(null);
  const listenersRef = useRef(new Set());
  const reconnectTimeoutRef = useRef(null);
  const pingIntervalRef = useRef(null);

  const subscribeListener = useCallback((fn) => {
    listenersRef.current.add(fn);
    return () => {
      listenersRef.current.delete(fn);
    };
  }, []);

  const send = useCallback((data) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify(data));
      } catch {
        // Ignore write error
      }
    }
  }, []);

  const connect = useCallback(() => {
    try {
      const token = localStorage.getItem('player_token') || '';
      let baseWs = import.meta.env.VITE_WS_URL;
      if (!baseWs) {
        if (typeof window !== 'undefined') {
          const host = window.location.hostname;
          if (host === 'localhost' || host === '127.0.0.1') {
            baseWs = 'wss://breww-ysqj.onrender.com/ws';
          } else {
            const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            baseWs = `${proto}//${window.location.host}/ws`;
          }
        } else {
          baseWs = 'wss://breww-ysqj.onrender.com/ws';
        }
      }
      baseWs = baseWs.replace(/\/$/, '');
      const wsUrl = `${baseWs}${token ? `${baseWs.includes('?') ? '&' : '?'}token=${encodeURIComponent(token)}` : ''}`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        if (token) {
          ws.send(JSON.stringify({ action: 'auth', token }));
        }

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

          // Global balance update across the entire platform
          if (msg.type === 'BALANCE_UPDATE' && typeof msg.balance === 'number') {
            setBalance(msg.balance);
          }

          // Dispatch to all active game listeners
          for (const fn of listenersRef.current) {
            try {
              fn(msg);
            } catch {
              // Listener error ignored
            }
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
  }, [setBalance]);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectTimeoutRef.current);
      clearInterval(pingIntervalRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [connect]);

  return (
    <WebSocketContext.Provider value={{ isConnected, send, subscribeListener }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  return useContext(WebSocketContext) || { isConnected: false, send: () => {}, subscribeListener: () => () => {} };
};
