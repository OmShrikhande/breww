import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiClient } from '../lib/apiClient';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const persist = (token, nextUser) => {
    if (token) localStorage.setItem('player_token', token);
    if (nextUser) localStorage.setItem('player_user', JSON.stringify(nextUser));
  };

  const clear = () => {
    localStorage.removeItem('player_token');
    localStorage.removeItem('player_user');
    setUser(null);
  };

  const refreshMe = useCallback(async () => {
    const token = localStorage.getItem('player_token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return null;
    }
    try {
      const res = await apiClient('/auth/me');
      setUser(res.data);
      localStorage.setItem('player_user', JSON.stringify(res.data));
      return res.data;
    } catch {
      clear();
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const cached = localStorage.getItem('player_user');
    if (cached) {
      try {
        setUser(JSON.parse(cached));
      } catch {
        // ignore
      }
    }
    refreshMe();
  }, [refreshMe]);

  const login = useCallback(async ({ method, identifier, password }) => {
    const res = await apiClient('/auth/login', {
      method: 'POST',
      auth: false,
      body: { method, identifier, password },
    });
    persist(res.data.token, res.data.user);
    setUser(res.data.user);
    return res.data;
  }, []);

  const register = useCallback(async ({ method, identifier, password, inviteCode }) => {
    const res = await apiClient('/auth/register', {
      method: 'POST',
      auth: false,
      body: { method, identifier, password, inviteCode },
    });
    persist(res.data.token, res.data.user);
    setUser(res.data.user);
    return res.data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiClient('/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    clear();
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user && localStorage.getItem('player_token')),
      login,
      register,
      logout,
      refreshMe,
      setUser,
    }),
    [user, loading, login, register, logout, refreshMe]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
