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
      setMessage(`Transaction ${action}d`);
      load();
    } catch (e) {
      setMessage(e.message || 'Action failed');
    }
  };

  return (
    <div className="transactions-page">
      <div className="tx-header">
        <h1>Recharge & Cashout</h1>
        <p>Approve player coin recharge and cashout requests</p>
      </div>

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

      {message && <p className="tx-message">{message}</p>}
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
    </div>
  );
};

export default TransactionsPage;
