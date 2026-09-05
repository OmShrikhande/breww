import React, { useCallback, useEffect, useState } from 'react';
import apiService from '../../configs/service';
import API_ENDPOINTS from '../../configs/api';
import { useAuth } from '../../contexts/AuthContext';
import './TransactionsPage.css';

const formatINR = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

const TransactionsPage = () => {
  const { canWrite } = useAuth();
  const [tab, setTab] = useState('pending');
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Manual Recharge Modal state
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [rechargeAmount, setRechargeAmount] = useState('500');
  const [rechargeNote, setRechargeNote] = useState('');
  const [submittingRecharge, setSubmittingRecharge] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, listRes] = await Promise.all([
        apiService.get(API_ENDPOINTS.TRANSACTIONS_STATS),
        apiService.get(
          tab === 'pending'
            ? API_ENDPOINTS.TRANSACTIONS_PENDING
            : `${API_ENDPOINTS.TRANSACTIONS}?limit=50`
        ),
      ]);
      setStats(statsRes.data || null);
      setItems(tab === 'pending' ? listRes.data || [] : listRes.data?.transactions || []);
    } catch (e) {
      setMessage(e.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [tab]);

  const loadUsersForRecharge = async () => {
    try {
      const res = await apiService.get(`${API_ENDPOINTS.USERS}?limit=200`);
      const userList = res.data?.users || [];
      setAllUsers(userList);
      if (userList.length > 0 && !selectedUserId) {
        setSelectedUserId(userList[0].id);
      }
    } catch (e) {
      console.error('Failed to load users for recharge:', e);
    }
  };

  const handleOpenRechargeModal = () => {
    loadUsersForRecharge();
    setShowRechargeModal(true);
    setRechargeAmount('500');
    setRechargeNote('');
  };

  const handleManualRechargeSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!selectedUserId || !rechargeAmount || Number(rechargeAmount) <= 0 || submittingRecharge) return;
    setSubmittingRecharge(true);
    setMessage('');
    setSuccessMsg('');
    try {
      await apiService.patch(API_ENDPOINTS.USER_BALANCE(selectedUserId), {
        action: 'add',
        amount: Number(rechargeAmount),
        note: rechargeNote || 'Manual recharge by admin',
      });
      const targetUser = allUsers.find(u => u.id === Number(selectedUserId));
      setSuccessMsg(`✅ Successfully recharged ₹${Number(rechargeAmount).toLocaleString()} for ${targetUser?.username || `User #${selectedUserId}`}`);
      setShowRechargeModal(false);
      load();
      setTimeout(() => setSuccessMsg(''), 6000);
    } catch (err) {
      setMessage(err.message || 'Manual recharge failed');
    } finally {
      setSubmittingRecharge(false);
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, [load]);

  const act = async (id, action) => {
    if (!canWrite) return;
    const reason = action === 'reject' ? prompt('Rejection reason:') : null;
    if (action === 'reject' && !reason) return;
    try {
      const endpoint = action === 'approve' ? API_ENDPOINTS.TRANSACTION_APPROVE(id) : API_ENDPOINTS.TRANSACTION_REJECT(id);
      await apiService.patch(endpoint, action === 'reject' ? { reason } : {});
      setSuccessMsg(`✅ Transaction ${action}d successfully`);
      setTimeout(() => setSuccessMsg(''), 4000);
      load();
    } catch (e) {
      setMessage(e.message || 'Action failed');
    }
  };

  return (
    <div className="transactions-page">
      <div className="tx-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1>Recharge & Cashout</h1>
          <p>Approve player coin recharge and cashout requests</p>
        </div>
        {canWrite && (
          <button
            type="button"
            onClick={handleOpenRechargeModal}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              border: 'none',
              color: 'white',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
              transition: 'transform 0.15s ease',
            }}
          >
            💳 <span>Manual Recharge User</span>
          </button>
        )}
      </div>

      {successMsg && (
        <div style={{ padding: '12px 16px', background: 'rgba(34, 197, 94, 0.2)', border: '1px solid #22c55e', borderRadius: '8px', color: '#4ade80', fontWeight: 'bold', fontSize: '0.9rem', marginTop: '12px', marginBottom: '8px' }}>
          {successMsg}
        </div>
      )}

      {stats && (
        <div className="tx-stats">
          <div><span>Deposits</span><strong>{formatINR(stats.totalDeposits)}</strong></div>
          <div><span>Withdrawals</span><strong>{formatINR(stats.totalWithdrawals)}</strong></div>
          <div><span>Pending</span><strong>{stats.pendingCount}</strong></div>
        </div>
      )}

      <div className="tx-tabs">
        <button type="button" className={tab === 'pending' ? 'active' : ''} onClick={() => setTab('pending')}>Pending</button>
        <button type="button" className={tab === 'all' ? 'active' : ''} onClick={() => setTab('all')}>All</button>
      </div>

      {message && <p className="tx-message" style={{ color: '#ef4444', fontWeight: 600 }}>{message}</p>}
      {loading && <p className="tx-loading">Loading…</p>}

      <div className="tx-list">
        {items.map((tx) => (
          <div key={tx.txId} className="tx-card">
            <div>
              <strong>{tx.username || `User #${tx.userId}`}</strong>
              <span className={`tx-type tx-type--${tx.type}`}>{tx.type}</span>
            </div>
            <div className="tx-amount">{formatINR(tx.amount)}</div>
            <div className="tx-meta">
              <span>{tx.method} · {tx.status || 'pending'}</span>
              {tx.utr && (
                <span className="tx-utr-badge" style={{ display: 'inline-block', marginLeft: '8px', color: '#10b981', fontWeight: 'bold' }}>
                  UTR: {tx.utr}
                </span>
              )}
            </div>
            {tab === 'pending' && canWrite && (
              <div className="tx-actions">
                <button type="button" onClick={() => act(tx.txId, 'approve')}>Approve</button>
                <button type="button" className="danger" onClick={() => act(tx.txId, 'reject')}>Reject</button>
              </div>
            )}
          </div>
        ))}
        {!loading && items.length === 0 && <p className="tx-empty">No transactions</p>}
      </div>

      {/* Manual Recharge Modal */}
      {showRechargeModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
          onClick={() => setShowRechargeModal(false)}
        >
          <div
            style={{
              background: '#0d1326',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '16px',
              padding: '24px',
              width: '100%',
              maxWidth: '460px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                  💳
                </div>
                <div>
                  <h3 style={{ margin: 0, color: 'white', fontSize: '1.15rem' }}>Manual User Recharge</h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>Credit player wallet instantly with approved funds</p>
                </div>
              </div>
              <button
                onClick={() => setShowRechargeModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleManualRechargeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                  Select Player
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: '#131b38',
                    border: '1px solid #2a3763',
                    color: 'white',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    outline: 'none',
                  }}
                >
                  {allUsers.length === 0 ? (
                    <option value="">Loading users...</option>
                  ) : (
                    allUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        #{u.id} {u.username} {u.phone ? `(📱 +91 ${u.phone})` : ''} — Bal: ₹{Number(u.balance || 0).toLocaleString()}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                  Recharge Amount (₹)
                </label>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                  {['100', '500', '1000', '2000', '5000'].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setRechargeAmount(amt)}
                      style={{
                        flex: 1,
                        padding: '6px 2px',
                        borderRadius: '6px',
                        border: rechargeAmount === amt ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.1)',
                        background: rechargeAmount === amt ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255,255,255,0.05)',
                        color: rechargeAmount === amt ? '#10b981' : '#cbd5e1',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      +₹{amt}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="1"
                  step="1"
                  required
                  placeholder="Enter amount in ₹"
                  value={rechargeAmount}
                  onChange={(e) => setRechargeAmount(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: '#131b38',
                    border: '1px solid #2a3763',
                    color: 'white',
                    fontSize: '1rem',
                    fontWeight: 800,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                  Recharge Note / Remark (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Manual UPI recharge / Admin deposit"
                  value={rechargeNote}
                  onChange={(e) => setRechargeNote(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    background: '#131b38',
                    border: '1px solid #2a3763',
                    color: 'white',
                    fontSize: '0.85rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setShowRechargeModal(false)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.08)',
                    border: 'none',
                    color: '#94a3b8',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRecharge || !rechargeAmount || Number(rechargeAmount) <= 0 || !selectedUserId}
                  style={{
                    flex: 2,
                    padding: '10px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    border: 'none',
                    color: 'white',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)',
                    opacity: submittingRecharge ? 0.7 : 1,
                  }}
                >
                  {submittingRecharge ? 'Recharging…' : `Confirm ₹${Number(rechargeAmount || 0).toLocaleString()}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsPage;

