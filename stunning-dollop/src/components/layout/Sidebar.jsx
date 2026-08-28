import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './Sidebar.css';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'games',     label: 'Games',     icon: '🎮' },
  { id: 'users',     label: 'Users',     icon: '👥' },
  { id: 'analytics', label: 'Analytics', icon: '📈' },
  { id: 'transactions', label: 'Payments', icon: '💳' },
  { id: 'settings',  label: 'Settings',  icon: '⚙️' },
];

const Sidebar = ({ activePage, onNavigate, collapsed, onToggleCollapse, mobileOpen, onCloseMobile }) => {
  const { user, logout, roleLabel } = useAuth();

  const handleNavClick = (id) => {
    onNavigate(id);
    onCloseMobile();
  };

  return (
    <>
      {mobileOpen && <div className="sidebar-overlay" onClick={onCloseMobile} />}

      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="brand-icon">🎰</div>
            {!collapsed && (
              <div className="brand-text">
                <span className="brand-name">GameAdmin</span>
                <span className="brand-sub">Control Panel</span>
              </div>
            )}
          </div>
          <button className="sidebar-collapse-btn" onClick={onToggleCollapse} title={collapsed ? 'Expand' : 'Collapse'}>
            {collapsed ? '›' : '‹'}
          </button>
        </div>

        <div className="sidebar-divider" />

        <nav className="sidebar-nav">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`nav-item ${activePage === item.id ? 'nav-item--active' : ''}`}
              onClick={() => handleNavClick(item.id)}
              title={collapsed ? item.label : ''}
            >
              <span className="nav-icon">{item.icon}</span>
              {!collapsed && <span className="nav-label">{item.label}</span>}
              {!collapsed && activePage === item.id && <span className="nav-active-dot" />}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-divider" />
          <div className={`sidebar-user ${collapsed ? 'sidebar-user--collapsed' : ''}`}>
            <div className="user-avatar-wrap">
              <div className="user-avatar">
                {(user?.email || user?.username || 'A')[0].toUpperCase()}
              </div>
              <span className="user-status-dot" />
            </div>
            {!collapsed && (
              <div className="user-meta">
                <span className="user-email truncate">{user?.name || user?.email || user?.username}</span>
                <span className="user-role">{roleLabel}</span>
              </div>
            )}
            {!collapsed && (
              <button className="logout-icon-btn" onClick={logout} title="Logout">
                🚪
              </button>
            )}
          </div>
          {collapsed && (
            <button className="logout-icon-btn logout-icon-btn--center" onClick={logout} title="Logout">
              🚪
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
