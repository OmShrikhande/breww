import React, { useEffect, useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { useAuth } from '../context/AuthContext';
import { useAudio } from '../context/AudioContext';
import { requestDeposit, requestWithdraw, getWalletTransactions } from '../api/walletApi';
import { formatINR } from '../utils/formatCurrency';
import { navigateTo } from '../lib/navigation';
import {
  Coins,
  ArrowDownCircle,
  ArrowUpCircle,
  Clock,
  Zap,
  CheckCircle2,
  Building,
  CreditCard,
  QrCode,
} from 'lucide-react';

const QUICK_AMOUNTS = [100, 300, 500, 1000, 2000, 5000, 10000];

const PAYMENT_CHANNELS = [
  { id: 'upi', name: 'UPI Fast Pay', bonus: '+3% Bonus', icon: QrCode, popular: true },
  { id: 'gpay', name: 'Google Pay / PhonePe', bonus: '+2% Bonus', icon: Zap },
  { id: 'imps', name: 'IMPS Bank Transfer', bonus: 'Direct Transfer', icon: Building },
];

const WalletPage = () => {
  const { balance, refreshBalance } = useWallet();
  const { isAuthenticated } = useAuth();
  const { playWin, playChip } = useAudio();

  const [tab, setTab] = useState('recharge');
  const [amount, setAmount] = useState('500');
  const [selectedChannel, setSelectedChannel] = useState('upi');
  const [message, setMessage] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [txs, setTxs] = useState([]);
  const [loading, setLoading] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

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
    if (!value || value <= 0) {
      showToast('⚠️ Please enter a valid amount');
      return;
    }

    if (tab === 'recharge' && value < 100) {
      showToast('⚠️ Minimum recharge amount is ₹100');
      return;
    }

    if (tab === 'cashout' && value < 500) {
      showToast('⚠️ Minimum withdrawal amount is ₹500');
      return;
    }

    if (tab === 'cashout' && value > balance) {
      showToast('⚠️ Insufficient wallet balance');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      playChip();
      const fn = tab === 'recharge' ? requestDeposit : requestWithdraw;
      const res = await fn(value);
      playWin();
      showToast(`🎉 ${res.message || (tab === 'recharge' ? 'Recharge Request Submitted!' : 'Withdrawal Request Submitted!')}`);
      setMessage(res.message || 'Request submitted successfully');
      await refreshBalance();
      setTxs(await getWalletTransactions());
    } catch (e) {
      showToast(`❌ ${e.message || 'Request failed'}`);
      setMessage(e.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-3 sm:px-4 py-4 space-y-4 select-none pb-24 animate-fadeIn">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-white px-5 py-2.5 rounded-full text-xs font-black shadow-2xl flex items-center gap-2 max-w-[90%] text-center animate-bounce">
          <CheckCircle2 size={16} /> {toastMessage}
        </div>
      )}

      {/* Balance Hero Card */}
      <div className="rounded-3xl border border-casino-gold/30 bg-gradient-to-br from-[#1c1836] via-[#0d1424] to-[#121c38] p-5 sm:p-6 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-4 opacity-15 pointer-events-none">
          <Coins size={90} className="text-casino-gold" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-white/50 block mb-1">
          Total Wallet Balance
        </span>
        <p className="text-3xl sm:text-4xl font-black text-casino-gold font-mono tracking-tight tabular-nums">
          {formatINR(balance)}
        </p>
      </div>

      {/* Recharge / Cashout Tabs */}
      <div className="flex gap-1.5 p-1 rounded-2xl bg-[#0d1424]/90 border border-white/10 shadow-lg">
        {[
          { id: 'recharge', label: 'Recharge (Deposit)', icon: ArrowDownCircle },
          { id: 'cashout', label: 'Withdraw (Cash Out)', icon: ArrowUpCircle },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              playChip();
              setTab(id);
              setMessage('');
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              tab === id
                ? 'bg-gradient-to-r from-casino-gold to-orange-500 text-slate-950 shadow-md'
                : 'text-white/40 hover:text-white/70'
            }`}
          >
            <Icon size={16} />
            <span className="truncate">{label}</span>
          </button>
        ))}
      </div>

      {/* Payment Channel Selection (For Recharge) */}
      {tab === 'recharge' && (
        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-white/50 px-1 block">
            Select Deposit Channel
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {PAYMENT_CHANNELS.map((ch) => (
              <button
                key={ch.id}
                type="button"
                onClick={() => {
                  playChip();
                  setSelectedChannel(ch.id);
                }}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  selectedChannel === ch.id
                    ? 'border-casino-gold bg-casino-gold/15 shadow-glow-gold'
                    : 'border-white/10 bg-[#0d1424]/80 text-white/70 hover:border-white/30'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-black/40 flex items-center justify-center text-casino-gold">
                    <ch.icon size={16} />
                  </div>
                  <div>
                    <h5 className="font-black text-xs text-white">{ch.name}</h5>
                    <span className="text-[9px] text-emerald-400 font-bold">{ch.bonus}</span>
                  </div>
                </div>
                {ch.popular && (
                  <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full bg-red-500 text-white">
                    HOT
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Amount Input & Preset Chips */}
      <div className="game-glass rounded-3xl border border-white/10 bg-[#0d1424]/90 p-5 space-y-4 shadow-xl">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-white/50 block mb-2">
            {tab === 'recharge' ? 'Recharge Amount (₹)' : 'Withdrawal Amount (₹)'}
          </span>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-black text-white/40">₹</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={tab === 'recharge' ? 'Min ₹100' : 'Min ₹500'}
              className="w-full rounded-2xl border border-white/10 bg-black/40 px-8 py-3.5 text-2xl font-black text-white text-center focus:outline-none focus:border-casino-gold focus:ring-1 focus:ring-casino-gold tabular-nums"
            />
          </div>
        </div>

        {/* Quick Amount Preset Chips */}
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
          {QUICK_AMOUNTS.map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => {
                playChip();
                setAmount(String(val));
              }}
              className={`py-2 rounded-xl text-xs font-mono font-black border transition-all active:scale-95 cursor-pointer flex items-center justify-center ${
                Number(amount) === val
                  ? 'border-casino-gold bg-casino-gold text-slate-950 shadow-md'
                  : 'border-white/10 bg-white/5 text-white/70 hover:border-white/30 hover:text-white'
              }`}
            >
              ₹{val >= 1000 ? `${val / 1000}K` : val}
            </button>
          ))}
        </div>

        {/* Submit Action Button */}
        <button
          type="button"
          disabled={loading}
          onClick={submit}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-casino-gold via-amber-400 to-orange-500 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Zap size={16} fill="currentColor" />
              {tab === 'recharge' ? 'Instant Recharge Now' : 'Request Withdrawal'}
            </>
          )}
        </button>
      </div>

      {/* Transaction History Log */}
      <div className="game-glass rounded-3xl border border-white/10 bg-[#0d1424]/90 overflow-hidden shadow-xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/40">
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-casino-gold" />
            <span className="text-xs font-black uppercase tracking-wider text-white">Recent Transactions</span>
          </div>
          <span className="text-[10px] text-white/40">{txs.length} records</span>
        </div>
        <div className="divide-y divide-white/5 max-h-56 overflow-y-auto custom-scrollbar">
          {txs.length === 0 && (
            <p className="p-6 text-center text-xs text-white/30">No transactions recorded yet</p>
          )}
          {txs.map((tx) => (
            <div key={tx.txId} className="flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors">
              <div>
                <p className="text-xs font-black capitalize text-white">{tx.type}</p>
                <p className="text-[10px] text-white/40 uppercase font-mono">{tx.method} · {tx.txId?.slice(0, 8)}</p>
              </div>
              <div className="text-right">
                <p className="font-mono font-black text-white text-xs">{formatINR(tx.amount)}</p>
                <span
                  className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full ${
                    tx.status === 'approved'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : tx.status === 'pending'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {tx.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WalletPage;
