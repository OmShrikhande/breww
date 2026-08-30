import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiService from '../configs/service';
import API_ENDPOINTS from '../configs/api';
import { canWrite, isSuperAdmin, roleLabel } from '../utils/roles';

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lastLoginAttempt, setLastLoginAttempt] = useState(null);

  const clearSession = useCallback(() => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_token_expiry');
    localStorage.removeItem('admin_user');
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiService.post(API_ENDPOINTS.AUTH_LOGOUT, {});
    } catch {
      // clear local session even if API logout fails
    }
    clearSession();
    setLoginAttempts(0);
  }, [clearSession]);

  useEffect(() => {
    const restore = async () => {
      const token = localStorage.getItem('admin_token');
      const expiry = localStorage.getItem('admin_token_expiry');
      const storedUser = localStorage.getItem('admin_user');

      if (!token || !expiry || !storedUser) {
        setLoading(false);
        return;
      }

      if (Date.now() >= parseInt(expiry, 10)) {
        clearSession();
        setLoading(false);
        return;
      }

      try {
        const me = await apiService.get(API_ENDPOINTS.AUTH_ME);
        if (me.success && me.data) {
          setUser(me.data);
          localStorage.setItem('admin_user', JSON.stringify(me.data));
          setIsAuthenticated(true);
        } else {
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
        }
      } catch {
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      }
      setLoading(false);
    };

    restore();
  }, [clearSession]);

  const isRateLimited = useCallback(() => {
    if (!lastLoginAttempt) return false;
    const now = Date.now();
    const timeDiff = now - lastLoginAttempt;
    const oneHour = 60 * 60 * 1000;
    if (timeDiff < oneHour && loginAttempts >= 5) return true;
    if (timeDiff >= oneHour) {
      setLoginAttempts(0);
      return false;
    }
    return false;
  }, [lastLoginAttempt, loginAttempts]);

  const login = useCallback(async (email, password) => {
    if (isRateLimited()) {
      throw new Error('Too many login attempts. Please try again later.');
    }

    const now = Date.now();
    setLastLoginAttempt(now);

    if (!email || !password) {
      setLoginAttempts((prev) => prev + 1);
      throw new Error('Email and password are required');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setLoginAttempts((prev) => prev + 1);
      throw new Error('Please enter a valid email address');
    }

    if (password.length < 6) {
      setLoginAttempts((prev) => prev + 1);
      throw new Error('Password must be at least 6 characters');
    }

    try {
      const response = await apiService.post(
        API_ENDPOINTS.ADMIN_LOGIN,
        { email, password },
        {},
        { auth: false }
      );

      if (!response.success) {
        throw new Error(response.message || 'Login failed');
      }

      const { token, admin } = response.data || {};
      if (!token) {
        setLoginAttempts((prev) => prev + 1);
        throw new Error('No token received from server');
      }

      const expiry = now + 24 * 60 * 60 * 1000;
      localStorage.setItem('admin_token', token);
      localStorage.setItem('admin_token_expiry', expiry.toString());
      localStorage.setItem('admin_user', JSON.stringify(admin));

      setIsAuthenticated(true);
      setUser(admin);
      setLoginAttempts(0);
      return true;
    } catch (error) {
      setLoginAttempts((prev) => prev + 1);
      if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
        throw new Error(
          'Unable to connect to the admin API. Ensure the Render backend is running (https://breww-ysqj.onrender.com).'
        );
      }
      if (error.message.includes('DEPLOYMENT_NOT_FOUND')) {
        throw new Error(
          'Wrong API URL — remove VITE_API_BASE_URL from Vercel if it points to a vercel.app URL. Redeploy after fixing env vars.'
        );
      }
      throw error;
    }
  }, [isRateLimited]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const checkInactivity = () => {
      const lastActivity = localStorage.getItem('admin_last_activity');
      const now = Date.now();
      if (lastActivity) {
        const inactiveTime = now - parseInt(lastActivity, 10);
        if (inactiveTime > 24 * 60 * 60 * 1000) {
          logout();
          return;
        }
      }
      localStorage.setItem('admin_last_activity', now.toString());
    };
    const interval = setInterval(checkInactivity, 60000);
    return () => clearInterval(interval);
  }, [isAuthenticated, logout]);

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    loginAttempts,
    isRateLimited: isRateLimited(),
    role: user?.role,
    roleLabel: roleLabel(user?.role),
    canWrite: canWrite(user),
    isSuperAdmin: isSuperAdmin(user),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
