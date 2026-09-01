import React, { useEffect, useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { useAuth } from '../context/AuthContext';
import { useAudio } from '../context/AudioContext';
import { requestDeposit, requestWithdraw, getWalletTransactions, getPaymentQrConfig } from '../api/walletApi';
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
  Copy,
  CheckCheck,
  X,
  Smartphone,
  ShieldCheck,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

const QUICK_AMOUNTS = [100, 300, 500, 1000, 2000, 5000, 10000];

const PAYMENT_CHANNELS = [
  { id: 'upi_qr', name: 'UPI QR Fast Pay', bonus: '+3% Extra Coins', icon: QrCode, popular: true },
  { id: 'gpay', name: 'Google Pay / PhonePe', bonus: '+2% Extra Coins', icon: Zap },
  { id: 'imps', name: 'IMPS Bank Transfer', bonus: 'Direct Transfer', icon: Building },
];

const WalletPage = () => {
  const { balance, refreshBalance } = useWallet();
  const { isAuthenticated } = useAuth();
  const { playWin, playChip } = useAudio();

  const [tab, setTab] = useState('recharge');
  const [amount, setAmount] = useState('500');
  const [selectedChannel, setSelectedChannel] = useState('upi_qr');
  const [message, setMessage] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [txs, setTxs] = useState([]);
  const [loading, setLoading] = useState(false);

  // QR Payment Modal State
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrConfig, setQrConfig] = useState({
    upiId: 'breeww@upi',
    merchantName: 'Breeww Gaming',
    qrImageUrl: '',
    minDeposit: 100,
    maxDeposit: 50000,
    bonusPercent: 3,
  });
  const [utrNumber, setUtrNumber] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [utrSubmitting, setUtrSubmitting] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    getWalletTransactions().then(setTxs).catch(() => setTxs([]));
    getPaymentQrConfig().then(setQrConfig).catch(() => {});
  }, [isAuthenticated, message]);

  const handleStartDeposit = () => {
    if (!isAuthenticated) {
      navigateTo('/login');
      return;
    }
    const val = Number(amount);
    if (!val || val < 100) {
      showToast('⚠️ Minimum recharge amount is ₹100');
      return;
    }
    playChip();
    setUtrNumber('');
    setShowQrModal(true);
  };

  const handleCopyUpiId = () => {
    playChip();
    navigator.clipboard?.writeText(qrConfig.upiId).then(() => {
      setCopiedUpi(true);
      showToast('📋 UPI ID copied to clipboard!');
      setTimeout(() => setCopiedUpi(false), 2000);
    });
  };

  const handleCopyAmount = () => {
    playChip();
    navigator.clipboard?.writeText(String(amount)).then(() => {
      setCopiedAmount(true);
      showToast('📋 Amount copied to clipboard!');
      setTimeout(() => setCopiedAmount(false), 2000);
    });
  };

  const handleUtrSubmit = async (e) => {
    e.preventDefault();
    const cleanUtr = utrNumber.replace(/\D/g, '').trim();
    if (cleanUtr.length < 12) {
      showToast('⚠️ Please enter a valid 12-digit UPI UTR / Ref Number');
      return;
    }

    setUtrSubmitting(true);
    try {
      playChip();
      const res = await requestDeposit(Number(amount), {
        method: selectedChannel,
        utr: cleanUtr,
      });
      playWin();
      showToast('🎉 Deposit submitted! Coins will be credited in 1–2 minutes.');
      setShowQrModal(false);
      setUtrNumber('');
      await refreshBalance();
      setTxs(await getWalletTransactions());
    } catch (err) {
      showToast(`❌ ${err.message || 'Deposit submission failed'}`);
    } finally {
      setUtrSubmitting(false);
    }
  };

  const handleWithdrawSubmit = async () => {
    if (!isAuthenticated) {
      navigateTo('/login');
      return;
    }
    const val = Number(amount);
    if (!val || val < 500) {
      showToast('⚠️ Minimum cashout is ₹500');
      return;
    }
    if (val > balance) {
      showToast('⚠️ Insufficient wallet balance');
      return;
    }

    setLoading(true);
    try {
      playChip();
      const res = await requestWithdraw(val, 'upi');
      playWin();
      showToast('🎉 Withdrawal request submitted successfully!');
      setMessage(res.message || 'Withdrawal submitted');
      await refreshBalance();
      setTxs(await getWalletTransactions());
    } catch (err) {
      showToast(`❌ ${err.message || 'Withdrawal failed'}`);
    } finally {
      setLoading(false);
    }
  };

  const upiDeepLink = `upi://pay?pa=${encodeURIComponent(qrConfig.upiId)}&pn=${encodeURIComponent(qrConfig.merchantName)}&am=${encodeURIComponent(amount)}&cu=INR&tn=${encodeURIComponent('Breeww Deposit')}`;

  return (
    <div className="px-3 sm:px-4 py-4 space-y-4 select-none pb-24 animate-fadeIn">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[140] bg-emerald-500 text-white px-5 py-2.5 rounded-full text-xs font-black shadow-2xl flex items-center gap-2 max-w-[90%] text-center animate-bounce">
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
        {tab === 'recharge' ? (
          <button
            type="button"
            disabled={loading}
            onClick={handleStartDeposit}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-casino-gold via-amber-400 to-orange-500 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Zap size={16} fill="currentColor" /> Pay via UPI QR / Apps
          </button>
        ) : (
          <button
            type="button"
            disabled={loading}
            onClick={handleWithdrawSubmit}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Submitting…' : 'Request Cashout'}
          </button>
        )}
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
                <p className="text-[10px] text-white/40 uppercase font-mono">
                  {tx.method} {tx.utr ? `· UTR: ${tx.utr}` : ''}
                </p>
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

      {/* UPI QR PAYMENT MODAL (Tiranga / Big Mumbai / 1Win Style) */}
      {showQrModal && (
        <div className="fixed inset-0 z-[130] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-sm rounded-3xl bg-[#131b38] border border-casino-gold/40 p-5 sm:p-6 shadow-2xl text-white space-y-4 my-auto animate-fadeIn">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-casino-gold/20 text-casino-gold flex items-center justify-center">
                  <QrCode size={18} />
                </div>
                <div>
                  <h3 className="font-black text-sm uppercase text-white">Scan & Pay via UPI</h3>
                  <span className="text-[10px] text-emerald-400 font-bold">+3% Extra Coins Applied</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="text-white/40 hover:text-white cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Step 1: Scan QR or Pay via Apps */}
            <div className="text-center space-y-3 bg-black/40 p-3.5 rounded-2xl border border-white/5">
              {/* QR Code Container */}
              <div className="relative mx-auto bg-white p-3 rounded-2xl w-48 h-48 flex items-center justify-center shadow-inner">
                {qrConfig.qrImageUrl ? (
                  <img src={qrConfig.qrImageUrl} alt="UPI QR Code" className="w-full h-full object-contain" />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-950">
                    <QrCode size={130} className="text-slate-950" />
                    <span className="text-[9px] font-black uppercase text-slate-800 tracking-wider">Scan in Any UPI App</span>
                  </div>
                )}
              </div>

              {/* Amount & UPI ID Copy Tiles */}
              <div className="space-y-1.5 pt-1">
                {/* Copy Amount */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10 text-xs">
                  <span className="text-white/50 text-[11px]">Deposit Amount:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-casino-gold text-sm">₹{amount}</span>
                    <button
                      type="button"
                      onClick={handleCopyAmount}
                      className="p-1 rounded bg-casino-gold/15 text-casino-gold hover:bg-casino-gold/25 transition-colors cursor-pointer"
                      title="Copy Amount"
                    >
                      {copiedAmount ? <CheckCheck size={13} /> : <Copy size={13} />}
                    </button>
                  </div>
                </div>

                {/* Copy UPI ID */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10 text-xs">
                  <span className="text-white/50 text-[11px]">UPI ID (VPA):</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white text-xs">{qrConfig.upiId}</span>
                    <button
                      type="button"
                      onClick={handleCopyUpiId}
                      className="p-1 rounded bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition-colors cursor-pointer"
                      title="Copy UPI ID"
                    >
                      {copiedUpi ? <CheckCheck size={13} /> : <Copy size={13} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Pay with UPI App Direct Buttons */}
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                <a
                  href={upiDeepLink}
                  className="py-1.5 px-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[10px] uppercase flex items-center justify-center gap-1 shadow"
                >
                  GPay / PhonePe
                </a>
                <a
                  href={upiDeepLink}
                  className="py-1.5 px-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-black text-[10px] uppercase flex items-center justify-center gap-1 shadow"
                >
                  Paytm
                </a>
                <a
                  href={upiDeepLink}
                  className="py-1.5 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] uppercase flex items-center justify-center gap-1 shadow"
                >
                  Other UPI
                </a>
              </div>
            </div>

            {/* Step 2: 12-Digit UTR Submission */}
            <form onSubmit={handleUtrSubmit} className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-wider text-casino-gold flex items-center gap-1">
                  <ShieldCheck size={12} /> Enter 12-Digit UTR / Ref Number
                </label>
                <span className="text-[9px] text-white/40">Mandatory</span>
              </div>
              <input
                type="text"
                inputMode="numeric"
                maxLength={12}
                required
                value={utrNumber}
                onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, '').slice(0, 12))}
                placeholder="e.g. 423589102948"
                className="w-full h-11 px-3.5 rounded-xl bg-black/50 border border-white/15 text-white font-mono font-black text-center text-sm focus:outline-none focus:border-casino-gold focus:ring-1 focus:ring-casino-gold tracking-widest"
              />

              <p className="text-[10px] text-white/50 text-center leading-tight">
                After paying in your UPI app, copy the <strong>12-digit UTR / UPI Ref ID</strong> and submit above.
              </p>

              <button
                type="submit"
                disabled={utrSubmitting || utrNumber.length < 12}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-xs uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {utrSubmitting ? 'Verifying…' : 'Submit UTR & Claim Coins'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletPage;
