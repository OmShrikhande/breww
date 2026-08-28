import React, { useState, useEffect, useCallback } from 'react';
import apiService from '../../configs/service';
import API_ENDPOINTS from '../../configs/api';
import { normalizeUser } from '../../utils/mappers';
import { useAuth } from '../../contexts/AuthContext';
import './UsersPage.css';

const VIP_COLORS = {
  Diamond: '#4f8ef7', Platinum: '#a855f7', Gold: '#FFD700',
  Silver: '#aaa', Bronze: '#cd7f32', None: 'var(--text-muted)',
};

const UsersPage = () => {
  const { canWrite } = useAuth();
  const [users, setUsers] = useState([]);
  const [statsData, setStatsData] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionMenu, setActionMenu] = useState(null);
  const [sortBy, setSortBy] = useState('id');
  const [sortDir, setSortDir] = useState('asc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const sortMap = {
    id: 'id',
    username: 'username',
    balance: 'balance',
    totalBets: 'total_bets',
    vip: 'id',
    status: 'id',
  };

  const loadUsers = useCallback(async () => {
    try {
      setError('');
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter !== 'All') params.set('status', statusFilter);
      params.set('sortBy', sortMap[sortBy] || 'id');
      params.set('sortDir', sortDir === 'asc' ? 'ASC' : 'DESC');
      params.set('limit', '100');

      const [usersRes, statsRes] = await Promise.all([
        apiService.get(`${API_ENDPOINTS.USERS}?${params.toString()}`),
        apiService.get(API_ENDPOINTS.USERS_STATS),
      ]);

      setUsers((usersRes.data?.users || []).map(normalizeUser));
      setStatsData(statsRes.data || null);
    } catch (err) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, sortBy, sortDir]);

  useEffect(() => {
    const t = setTimeout(loadUsers, 250);
    return () => clearTimeout(t);
  }, [loadUsers]);

  const handleSort = (col) => {
    if (sortBy === col) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortBy(col);
      setSortDir('asc');
    }
  };

  const handleAction = async (userId, action) => {
    if (!canWrite || busy) return;
    setBusy(true);
    setActionMenu(null);
    try {
      if (action === 'reset-bal') {
        await apiService.patch(API_ENDPOINTS.USER_BALANCE(userId), { action: 'reset' });
      } else {
        await apiService.patch(API_ENDPOINTS.USER_STATUS(userId), { action });
      }
      await loadUsers();
    } catch (err) {
      setError(err.message || 'Action failed');
    } finally {
      setBusy(false);
    }
  };

  const SortArrow = ({ col }) => (
    <span className="sort-arrow">
      {sortBy === col ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ' ↕'}
    </span>
  );

  const stats = [
    { label: 'Total Users', val: statsData?.total ?? users.length, icon: '👥', c: 'var(--blue)' },
    { label: 'Active Users', val: statsData?.active ?? users.filter((u) => u.status === 'active').length, icon: '✅', c: 'var(--green)' },
    { label: 'Banned Users', val: statsData?.banned ?? users.filter((u) => u.status === 'banned').length, icon: '🚫', c: 'var(--red)' },
    { label: 'Diamond VIPs', val: statsData?.diamondVips ?? users.filter((u) => u.vip === 'Diamond').length, icon: '💎', c: 'var(--blue)' },
  ];

  if (loading) {
    return <div className="users-page"><p>Loading users…</p></div>;
  }

  return (
    <div className="users-page" onClick={() => setActionMenu(null)}>
      {error && <p className="usc-lbl" style={{ color: 'var(--red)', marginBottom: 8 }}>{error}</p>}

      <div className="users-stats">
        {stats.map((s, i) => (
          <div key={i} className="users-stat-card" style={{ '--c': s.c }}>
            <span className="usc-icon">{s.icon}</span>
            <span className="usc-val">{s.val}</span>
            <span className="usc-lbl">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="users-toolbar">
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input
            className="search-input"
            type="text"
            placeholder="Search by email or username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="status-filter">
          {['All', 'active', 'suspended', 'banned'].map((s) => (
            <button
              key={s}
              className={`status-filter-btn ${statusFilter === s ? 'status-filter-btn--active' : ''}`}
              onClick={() => setStatusFilter(s)}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="users-table-wrap">
        <table className="users-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('id')}>ID <SortArrow col="id" /></th>
              <th onClick={() => handleSort('username')}>User <SortArrow col="username" /></th>
              <th onClick={() => handleSort('balance')}>Balance <SortArrow col="balance" /></th>
              <th onClick={() => handleSort('totalBets')}>Bets <SortArrow col="totalBets" /></th>
              <th>Win / Loss</th>
              <th>VIP</th>
              <th>Status</th>
              <th>Last Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className={`user-row user-row--${u.status}`}>
                <td className="td-id">#{u.id}</td>
                <td className="td-user">
                  <div className="user-cell">
                    <div className="user-cell-avatar">{(u.username || '?')[0]}</div>
                    <div className="user-cell-info">
                      <span className="user-cell-name">{u.username}</span>
                      <span className="user-cell-email">{u.email}</span>
                    </div>
                  </div>
                </td>
                <td className="td-balance">₹{u.balance.toLocaleString()}</td>
                <td className="td-bets">{u.totalBets.toLocaleString()}</td>
                <td className="td-winloss">
                  <span className="win-amount">+₹{(u.totalWin / 1000).toFixed(0)}K</span>
                  {' / '}
                  <span className="loss-amount">-₹{(u.totalLoss / 1000).toFixed(0)}K</span>
                </td>
                <td className="td-vip">
                  <span className="vip-badge" style={{ color: VIP_COLORS[u.vip], borderColor: VIP_COLORS[u.vip] }}>
                    {u.vip}
                  </span>
                </td>
                <td className="td-status">
                  <span className={`badge badge-${u.status === 'active' ? 'active' : 'inactive'}`}>
                    <span className="badge-dot" />{u.status}
                  </span>
                </td>
                <td className="td-time">{u.lastActive}</td>
                <td className="td-actions" onClick={(e) => e.stopPropagation()}>
                  <div className="action-menu-wrap">
                    <button
                      className="action-menu-trigger"
                      onClick={() => setActionMenu(actionMenu === u.id ? null : u.id)}
                    >
                      ⋮
                    </button>
                    {actionMenu === u.id && (
                      <div className="action-dropdown">
                        {canWrite && (
                          <>
                            <button onClick={() => handleAction(u.id, 'activate')} className="act-btn act-btn--activate">✅ Activate</button>
                            <button onClick={() => handleAction(u.id, 'suspend')} className="act-btn act-btn--suspend">⏸ Suspend</button>
                            <button onClick={() => handleAction(u.id, 'ban')} className="act-btn act-btn--ban">🚫 Ban User</button>
                            <div className="act-divider" />
                            <button onClick={() => handleAction(u.id, 'reset-bal')} className="act-btn act-btn--reset">💸 Reset Balance</button>
                          </>
                        )}
                        <button className="act-btn act-btn--view" onClick={() => setSelectedUser(u)}>👁 View Details</button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="table-empty">
            <span>👥</span>
            <p>No users match your search</p>
          </div>
        )}
      </div>

      {selectedUser && (
        <div className="user-detail-overlay" onClick={() => setSelectedUser(null)}>
          <div className="user-detail-panel" onClick={(e) => e.stopPropagation()}>
            <div className="udp-header">
              <div className="udp-avatar">{(selectedUser.username || '?')[0]}</div>
              <div>
                <h3>{selectedUser.username}</h3>
                <p>{selectedUser.email}</p>
              </div>
              <button className="modal-close" onClick={() => setSelectedUser(null)}>✕</button>
            </div>
            <div className="udp-stats">
              {[
                { l: 'Balance', v: `₹${selectedUser.balance.toLocaleString()}` },
                { l: 'Total Bets', v: selectedUser.totalBets.toLocaleString() },
                { l: 'Total Won', v: `₹${selectedUser.totalWin.toLocaleString()}` },
                { l: 'Total Lost', v: `₹${selectedUser.totalLoss.toLocaleString()}` },
                { l: 'VIP Level', v: selectedUser.vip },
                { l: 'Status', v: selectedUser.status },
                { l: 'Joined', v: selectedUser.joined },
                { l: 'Last Active', v: selectedUser.lastActive },
              ].map(({ l, v }) => (
                <div key={l} className="udp-stat">
                  <span className="udp-stat-lbl">{l}</span>
                  <span className="udp-stat-val">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
