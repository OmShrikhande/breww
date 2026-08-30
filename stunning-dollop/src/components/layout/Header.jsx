import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../configs/service';
import API_ENDPOINTS from '../../configs/api';
import { formatRelative } from '../../utils/mappers';
import './Header.css';

const PAGE_TITLES = {
  dashboard: { title: 'Dashboard',  subtitle: 'Overview & key metrics' },
  games:     { title: 'Games',      subtitle: 'Manage all gambling games' },
  users:     { title: 'Users',      subtitle: 'Player management' },
  analytics: { title: 'Analytics',  subtitle: 'Revenue & performance data' },
  settings:  { title: 'Settings',   subtitle: 'System configuration' },
};

const Header = ({ activePage, onToggleMobileSidebar }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout, roleLabel } = useAuth();
  const [time, setTime] = useState(new Date());
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const loadNotifications = useCallback(async () => {
    try {
      const [listRes, unreadRes] = await Promise.all([
        apiService.get(`${API_ENDPOINTS.NOTIFICATIONS}?limit=10`, {}, { silent: true }),
        apiService.get(API_ENDPOINTS.NOTIFICATIONS_UNREAD, {}, { silent: true }),
      ]);
      if (!listRes || !unreadRes) return;
      const rows = listRes.data?.notifications || listRes.data || [];
      setNotifications(
        (Array.isArray(rows) ? rows : []).map((n) => ({
          id: n.id,
          text: n.title || n.body || n.text,
          time: formatRelative(n.created_at || n.createdAt || n.time),
          type: n.type || 'system',
        }))
      );
      setUnread(Number(unreadRes.data?.count ?? unreadRes.data?.unread ?? 0));
    } catch {
      // keep empty if notifications unavailable
    }
  }, []);

  useEffect(() => {
    loadNotifications();
    const t = setInterval(loadNotifications, 60000);
    return () => clearInterval(t);
  }, [loadNotifications]);

  const clearAll = async () => {
    try {
      await apiService.patch(API_ENDPOINTS.NOTIFICATIONS_READ_ALL, {});
      setUnread(0);
      await loadNotifications();
    } catch {
      // ignore
    }
  };

  const page = PAGE_TITLES[activePage] || PAGE_TITLES.dashboard;

  const notifIcons = { game: '🎮', user: '👤', revenue: '💰', system: '⚙️', alert: '⚠️', payout: '💸' };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="mobile-menu-btn" onClick={onToggleMobileSidebar} aria-label="Open menu">
          <span /><span /><span />
        </button>

        <div className="page-title-block">
          <h1 className="page-title">{page.title}</h1>
          <p className="page-subtitle">{page.subtitle}</p>
        </div>
      </div>

      <div className="topbar-right">
        <div className="topbar-clock">
          <span className="clock-time">{time.toLocaleTimeString('en-IN', { hour12: false })}</span>
          <span className="clock-date">{time.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
        </div>

        <button
          className="theme-toggle-btn"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          aria-label="Toggle theme"
        >
          <span className="theme-icon">{theme === 'dark' ? '☀️' : '🌙'}</span>
          <span className="theme-label">{theme === 'dark' ? 'Light' : 'Dark'}</span>
        </button>

        <div className="notif-wrapper">
          <button
            className="notif-btn"
            onClick={() => setNotifOpen(o => !o)}
            aria-label="Notifications"
          >
            🔔
            {unread > 0 && <span className="notif-badge">{unread}</span>}
          </button>

          {notifOpen && (
            <>
              <div className="notif-backdrop" onClick={() => setNotifOpen(false)} />
              <div className="notif-dropdown">
                <div className="notif-header">
                  <span>Notifications</span>
                  <span className="notif-count">{unread} new</span>
                </div>
                <div className="notif-list">
                  {notifications.length === 0 && (
                    <div className="notif-item"><div className="notif-body"><p className="notif-text">No notifications</p></div></div>
                  )}
                  {notifications.map(n => (
                    <div key={n.id} className={`notif-item notif-item--${n.type}`}>
                      <span className="notif-icon">{notifIcons[n.type] || '🔔'}</span>
                      <div className="notif-body">
                        <p className="notif-text">{n.text}</p>
                        <span className="notif-time">{n.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="notif-clear" onClick={clearAll}>Clear all</button>
              </div>
            </>
          )}
        </div>

        <div className="header-user">
          <div className="header-avatar">
            {(user?.name || user?.email || user?.username || 'A')[0].toUpperCase()}
          </div>
          <div className="header-user-info">
            <span className="header-username truncate">{user?.name || user?.email || user?.username}</span>
            <span className="header-role">{roleLabel}</span>
          </div>
          <button className="header-logout" onClick={logout} title="Logout">
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
