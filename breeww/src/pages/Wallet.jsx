import React, { useEffect, useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { useAuth } from '../context/AuthContext';
import { requestDeposit, requestWithdraw, getWalletTransactions } from '../api/walletApi';
import { formatINR } from '../utils/formatCurrency';
import { navigateTo } from '../lib/navigation';
import { Coins, ArrowDownCircle, ArrowUpCircle, Clock } from 'lucide-react';

const WalletPage = () => {
  const { balance, refreshBalance } = useWallet();
  const { isAuthenticated } = useAuth();
  const [tab, setTab] = useState('recharge');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [txs, setTxs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    getWalletTransactions().then(setTxs).catch(() => setTxs([]));
  }, [isAuthenticated, message]);

  const submit = async () => {
    if (!isAuthenticated) {
      navigateTo('/login');
      return;
    }
    const value = Number(amount);
    if (!value || value <= 0) return;
    setLoading(true);
    setMessage('');
    try {
      const fn = tab === 'recharge' ? requestDeposit : requestWithdraw;
      const res = await fn(value);
      setMessage(res.message || 'Request submitted');
      setAmount('');
      await refreshBalance();
      setTxs(await getWalletTransactions());
    } catch (e) {
      setMessage(e.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 py-6 space-y-5">
      <div className="rounded-2xl border border-casino-gold/30 bg-gradient-to-br from-casino-gold/15 to-orange-500/5 p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-20">
          <Coins size={64} className="text-casino-gold" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Your coins</p>
        <p className="text-4xl font-black text-casino-gold mt-1 tabular-nums">{formatINR(balance)}</p>
      </div>

      <div className="flex gap-2 p-1 rounded-xl bg-white/5 border border-white/10">
        {[
          { id: 'recharge', label: 'Recharge', icon: ArrowDownCircle },
          { id: 'cashout', label: 'Cash Out', icon: ArrowUpCircle },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-black uppercase tracking-wide transition-all ${
              tab === id ? 'bg-casino-accent text-white shadow-glow' : 'text-white/45'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      <div className="game-glass rounded-2xl border border-white/10 p-5 space-y-4">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={tab === 'recharge' ? 'Min ₹100' : 'Min ₹500'}
          className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-4 text-xl font-black text-white text-center focus:outline-none focus:border-casino-accent tabular-nums"
        />
        <button
          type="button"
          disabled={loading}
          onClick={submit}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-casino-accent to-blue-600 font-black uppercase tracking-wider text-white disabled:opacity-50 shadow-glow"
        >
          {loading ? 'Submitting…' : tab === 'recharge' ? 'Request Recharge' : 'Request Cashout'}
        </button>
        {message && <p className="text-center text-sm text-sky-300">{message}</p>}
      </div>

      <div className="game-glass rounded-2xl border border-white/10 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
          <Clock size={14} className="text-white/40" />
          <span className="text-xs font-black uppercase tracking-widest text-white/40">History</span>
        </div>
        <div className="divide-y divide-white/5">
          {txs.length === 0 && <p className="p-6 text-center text-sm text-white/30">No transactions yet</p>}
          {txs.map((tx) => (
            <div key={tx.txId} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-bold capitalize text-white">{tx.type}</p>
                <p className="text-[10px] text-white/35 uppercase">{tx.method}</p>
              </div>
              <div className="text-right">
                <p className="font-black text-white tabular-nums">{formatINR(tx.amount)}</p>
                <p className={`text-[10px] font-bold uppercase ${
                  tx.status === 'approved' ? 'text-emerald-400' : tx.status === 'pending' ? 'text-amber-400' : 'text-red-400'
                }`}>
                  {tx.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WalletPage;
