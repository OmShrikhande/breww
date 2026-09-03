import React, { useState } from 'react';
import {
  Settings,
  LogOut,
  Copy,
  CheckCheck,
  X,
  Volume2,
  VolumeX,
  CreditCard,
  History,
  Crown,
  ChevronRight,
  ArrowUpRight,
  ArrowDownLeft,
  Headphones,
  CheckCircle2,
  KeyRound,
  Building,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../hooks/useWallet';
import { useAudio } from '../context/AudioContext';
import { formatINR } from '../utils/formatCurrency';
import { navigateTo } from '../lib/navigation';

const SAMPLE_BET_RECORDS = [
  { game: 'Aviator', round: '#9281', bet: 50, mult: '2.34x', payout: 117, status: 'Won', time: '10m ago' },
  { game: 'WinGo', round: '#9182', bet: 100, mult: '2.00x', payout: 200, status: 'Won', time: '25m ago' },
  { game: 'Mines', round: '#8923', bet: 50, mult: '1.27x', payout: 63.5, status: 'Won', time: '1h ago' },
  { game: 'Dragon Tiger', round: '#8420', bet: 50, mult: '1.95x', payout: 0, status: 'Lost', time: '2h ago' },
  { game: 'Dice Roll', round: '#8112', bet: 20, mult: '8.00x', payout: 160, status: 'Won', time: '3h ago' },
];

const SAMPLE_TRANSACTIONS = [
  { type: 'Deposit', amount: 500, status: 'Success', method: 'UPI Instant', date: '2026-09-01 10:15' },
  { type: 'Withdrawal', amount: 1200, status: 'Completed', method: 'IMPS Bank', date: '2026-08-31 18:40' },
  { type: 'Bet Win', amount: 200, status: 'Credited', method: 'WinGo', date: '2026-08-31 16:22' },
  { type: 'Daily Bonus', amount: 50, status: 'Claimed', method: 'Check-in', date: '2026-08-31 09:00' },
];

const Account = () => {
  const { user, logout } = useAuth();
  const { balance } = useWallet();
  const { soundEnabled, toggleSound, playChip, playWin } = useAudio();

  const [loggingOut, setLoggingOut] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Password modal states
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  // Bank bind states
  const [bankName, setBankName] = useState('HDFC Bank');
  const [accNumber, setAccNumber] = useState('501002938192');
  const [ifsc, setIfsc] = useState('HDFC0000123');
  const [upiId, setUpiId] = useState('player@okaxis');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logout();
      navigateTo('/login');
    } catch {
      navigateTo('/login');
    }
  };

  const displayName = user?.name || user?.phone || 'Player';
  const initials = displayName.slice(0, 2).toUpperCase();
  const userId = user?.id ? String(user.id).padStart(8, '0') : '00928371';
  const displayPhone = user?.phone ? `+91 ${user.phone}` : '+91 98765 43210';

  const handleCopyId = () => {
    playChip();
    navigator.clipboard?.writeText(userId).then(() => {
      setCopied(true);
      showToast('📋 Account UID copied to clipboard!');
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const handleSavePassword = (e) => {
    e.preventDefault();
    if (!newPass || newPass !== confirmPass) {
      showToast('⚠️ New passwords do not match');
      return;
    }
    playWin();
    showToast('🔒 Login Password updated successfully!');
    setActiveModal(null);
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
  };

  const handleSaveBank = (e) => {
    e.preventDefault();
    playWin();
    showToast('🏦 Bank & UPI Details linked successfully!');
    setActiveModal(null);
  };

  return (
    <div className="pb-24 px-3 sm:px-4 pt-2 relative select-none animate-fadeIn">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#1C0202] border-2 border-amber-400 text-amber-200 px-5 py-2.5 rounded-full text-xs font-black shadow-2xl flex items-center gap-2 max-w-[90%] text-center animate-bounce">
          <CheckCircle2 size={16} className="text-amber-400" /> {toastMessage}
        </div>
      )}

      {/* Header Profile Hero (Tiranga / Big Mumbai / 1Win Style) */}
      <div className="relative rounded-3xl p-5 sm:p-6 mb-4 overflow-hidden border-2 border-amber-500/40 bg-gradient-to-br from-[#8B0000] via-[#450505] to-[#180202] shadow-2xl">
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 p-0.5 shadow-xl">
                  <div className="w-full h-full rounded-full bg-[#180202] flex items-center justify-center text-lg sm:text-xl font-black text-amber-300">
                    {initials}
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-500 text-red-950 flex items-center justify-center text-[10px] font-black border-2 border-[#180202]">
                  👑
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black text-white">{displayName}</h2>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[9px] font-black uppercase">
                    VIP 2
                  </span>
                </div>
                <p className="text-xs text-amber-200/60 font-mono">{displayPhone}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] font-mono text-white/50">UID: {userId}</span>
                  <button
                    type="button"
                    onClick={handleCopyId}
                    className="p-1 rounded hover:bg-white/10 text-amber-300 hover:text-white transition-colors cursor-pointer"
                    title="Copy UID"
                  >
                    {copied ? <CheckCheck size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveModal('security')}
              className="p-2.5 rounded-2xl bg-black/40 border border-amber-500/30 hover:bg-black/60 text-amber-300 hover:text-white transition-all cursor-pointer"
              title="Settings"
            >
              <Settings size={18} />
            </button>
          </div>

          {/* Balance & Action Buttons Card */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-black/50 border border-amber-500/20 flex items-center justify-between gap-3 shadow-inner">
            <div>
              <span className="text-[9px] font-bold uppercase tracking-widest text-amber-300/60 block">Total Balance</span>
              <span className="text-xl sm:text-2xl font-black text-amber-300 font-mono tracking-tight drop-shadow">
                {formatINR(balance)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigateTo('/wallet')}
                className="px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white text-xs font-black uppercase tracking-wider shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-1 cursor-pointer border border-white/30"
              >
                <ArrowDownLeft size={14} /> Deposit
              </button>
              <button
                type="button"
                onClick={() => navigateTo('/wallet')}
                className="px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-red-950 text-xs font-black uppercase tracking-wider shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-1 cursor-pointer border border-white/80"
              >
                <ArrowUpRight size={14} /> Withdraw
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Player Stats Grid */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="bg-[#1C0202]/95 border border-amber-500/25 rounded-2xl p-2.5 text-center shadow-md">
          <span className="text-[8px] sm:text-[9px] font-bold text-amber-300/60 uppercase block truncate">Total Bets</span>
          <span className="text-xs sm:text-sm font-black text-white font-mono">142</span>
        </div>
        <div className="bg-[#1C0202]/95 border border-amber-500/25 rounded-2xl p-2.5 text-center shadow-md">
          <span className="text-[8px] sm:text-[9px] font-bold text-amber-300/60 uppercase block truncate">Total Won</span>
          <span className="text-xs sm:text-sm font-black text-emerald-400 font-mono">₹18.9K</span>
        </div>
        <div className="bg-[#1C0202]/95 border border-amber-500/25 rounded-2xl p-2.5 text-center shadow-md">
          <span className="text-[8px] sm:text-[9px] font-bold text-amber-300/60 uppercase block truncate">Win Rate</span>
          <span className="text-xs sm:text-sm font-black text-amber-400 font-mono">68.4%</span>
        </div>
        <div className="bg-[#1C0202]/95 border border-amber-500/25 rounded-2xl p-2.5 text-center shadow-md">
          <span className="text-[8px] sm:text-[9px] font-bold text-amber-300/60 uppercase block truncate">Net Profit</span>
          <span className="text-xs sm:text-sm font-black text-emerald-400 font-mono">+₹4.2K</span>
        </div>
      </div>

      {/* Financial & History Hub (4 Core Tiles) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
        {[
          { label: 'Bet Records', icon: History, modal: 'bets', color: 'text-amber-400 bg-amber-500/20' },
          { label: 'Deposit History', icon: ArrowDownLeft, modal: 'deposits', color: 'text-emerald-400 bg-emerald-500/20' },
          { label: 'Withdraw History', icon: ArrowUpRight, modal: 'withdrawals', color: 'text-sky-400 bg-sky-500/20' },
          { label: 'Account Ledger', icon: CreditCard, modal: 'ledger', color: 'text-purple-400 bg-purple-500/20' },
        ].map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              playChip();
              setActiveModal(item.modal);
            }}
            className="rounded-2xl p-3 border border-amber-500/25 bg-[#1C0202]/95 hover:border-amber-400 flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer text-center shadow-md"
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border border-white/10 ${item.color}`}>
              <item.icon size={18} />
            </div>
            <span className="text-xs font-black text-white">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Account Security & Service Center */}
      <div className="rounded-3xl overflow-hidden border border-amber-500/30 bg-[#1C0202]/95 shadow-xl divide-y divide-amber-500/10 mb-4">
        <button
          type="button"
          onClick={() => {
            playChip();
            setActiveModal('security');
          }}
          className="w-full flex items-center justify-between p-3.5 sm:p-4 hover:bg-white/5 transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <KeyRound size={16} />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-white">Security & Password</h4>
              <p className="text-[10px] text-white/50">Update login password and security PIN</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-amber-400/60" />
        </button>

        <button
          type="button"
          onClick={() => {
            playChip();
            setActiveModal('bank');
          }}
          className="w-full flex items-center justify-between p-3.5 sm:p-4 hover:bg-white/5 transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-500/30 text-sky-400 flex items-center justify-center">
              <Building size={16} />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-white">Bank Card & UPI Accounts</h4>
              <p className="text-[10px] text-white/50">Manage withdrawal bank and UPI ID</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-amber-400/60" />
        </button>

        <button
          type="button"
          onClick={() => {
            playChip();
            toggleSound();
            showToast(!soundEnabled ? '🔊 Game Audio Enabled' : '🔇 Game Audio Muted');
          }}
          className="w-full flex items-center justify-between p-3.5 sm:p-4 hover:bg-white/5 transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center border border-white/10 ${soundEnabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-white/40'}`}>
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-white">Game Sounds & Audio</h4>
              <p className="text-[10px] text-white/50">Synthesizer FX and casino ambience</p>
            </div>
          </div>
          <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${soundEnabled ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/10 text-white/40'}`}>
            {soundEnabled ? 'ON' : 'OFF'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            playChip();
            setActiveModal('support');
          }}
          className="w-full flex items-center justify-between p-3.5 sm:p-4 hover:bg-white/5 transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-400 flex items-center justify-center">
              <Headphones size={16} />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-white">24/7 Live Customer Service</h4>
              <p className="text-[10px] text-white/50">Telegram support & instant ticket resolution</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-amber-400/60" />
        </button>
      </div>

      {/* Logout Button */}
      <button
        type="button"
        onClick={() => setActiveModal('logout')}
        className="w-full py-3 rounded-2xl bg-red-950/40 hover:bg-red-950/60 border border-red-500/40 text-red-400 text-xs font-black uppercase tracking-wider shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
      >
        <LogOut size={16} /> Log Out
      </button>

      {/* MODAL 1: Bet Records */}
      {activeModal === 'bets' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="rounded-3xl p-5 border-2 border-amber-500/40 bg-[#1C0202] max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-amber-500/20">
              <h3 className="font-black text-amber-300 text-sm uppercase tracking-wider">Game Bet Records</h3>
              <button type="button" onClick={() => setActiveModal(null)} className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white cursor-pointer"><X size={16} /></button>
            </div>
            <div className="overflow-y-auto max-h-64 custom-scrollbar space-y-2">
              {SAMPLE_BET_RECORDS.map((b, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-black/50 border border-white/5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-black text-white block">{b.game} · {b.round}</span>
                    <span className="text-[10px] text-white/40">{b.time} · Stake {formatINR(b.bet)} ({b.mult})</span>
                  </div>
                  <span className={`font-mono font-black ${b.status === 'Won' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {b.status === 'Won' ? `+${formatINR(b.payout)}` : `-${formatINR(b.bet)}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Deposits / Withdrawals / Ledger */}
      {(activeModal === 'deposits' || activeModal === 'withdrawals' || activeModal === 'ledger') && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="rounded-3xl p-5 border-2 border-amber-500/40 bg-[#1C0202] max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-amber-500/20">
              <h3 className="font-black text-amber-300 text-sm uppercase tracking-wider capitalize">{activeModal} Records</h3>
              <button type="button" onClick={() => setActiveModal(null)} className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white cursor-pointer"><X size={16} /></button>
            </div>
            <div className="overflow-y-auto max-h-64 custom-scrollbar space-y-2">
              {SAMPLE_TRANSACTIONS.map((t, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-black/50 border border-white/5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-black text-white block">{t.type} · {t.method}</span>
                    <span className="text-[10px] text-white/40">{t.date}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-black text-white block">{formatINR(t.amount)}</span>
                    <span className="text-[9px] text-emerald-400 font-bold uppercase">{t.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Security & Password */}
      {activeModal === 'security' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="rounded-3xl p-5 border-2 border-amber-500/40 bg-[#1C0202] max-w-sm w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-amber-500/20">
              <h3 className="font-black text-amber-300 text-sm uppercase tracking-wider">Change Password</h3>
              <button type="button" onClick={() => setActiveModal(null)} className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white cursor-pointer"><X size={16} /></button>
            </div>
            <form onSubmit={handleSavePassword} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-amber-300/70 uppercase block mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-amber-500/30 text-white text-xs focus:outline-none focus:border-amber-400"
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-amber-300/70 uppercase block mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-amber-500/30 text-white text-xs focus:outline-none focus:border-amber-400"
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-amber-300/70 uppercase block mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-amber-500/30 text-white text-xs focus:outline-none focus:border-amber-400"
                  placeholder="Confirm new password"
                />
              </div>
              <button
                type="submit"
                className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-red-950 font-black text-xs uppercase tracking-wider cursor-pointer border border-white/60"
              >
                Update Password
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Bank & UPI Accounts */}
      {activeModal === 'bank' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="rounded-3xl p-5 border-2 border-amber-500/40 bg-[#1C0202] max-w-sm w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-amber-500/20">
              <h3 className="font-black text-amber-300 text-sm uppercase tracking-wider">Bank & UPI Binding</h3>
              <button type="button" onClick={() => setActiveModal(null)} className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white cursor-pointer"><X size={16} /></button>
            </div>
            <form onSubmit={handleSaveBank} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-amber-300/70 uppercase block mb-1">Bank Name</label>
                <input
                  type="text"
                  required
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-amber-500/30 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-amber-300/70 uppercase block mb-1">Account Number</label>
                <input
                  type="text"
                  required
                  value={accNumber}
                  onChange={(e) => setAccNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-amber-500/30 text-white text-xs focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-amber-300/70 uppercase block mb-1">IFSC Code</label>
                <input
                  type="text"
                  required
                  value={ifsc}
                  onChange={(e) => setIfsc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-amber-500/30 text-white text-xs focus:outline-none focus:border-amber-400 font-mono uppercase"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-amber-300/70 uppercase block mb-1">UPI ID (VPA)</label>
                <input
                  type="text"
                  required
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-amber-500/30 text-white text-xs focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>
              <button
                type="submit"
                className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-black text-xs uppercase tracking-wider cursor-pointer shadow-lg border border-white/40"
              >
                Save Withdrawal Account
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: Support */}
      {activeModal === 'support' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="rounded-3xl p-6 border-2 border-amber-500/40 bg-[#1C0202] max-w-sm w-full shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-400 mx-auto flex items-center justify-center mb-3">
              <Headphones size={24} />
            </div>
            <h3 className="font-black text-white text-base mb-1">24/7 Live Customer Support</h3>
            <p className="text-xs text-white/60 mb-4">Our dedicated team is ready to assist you anytime with deposits, withdrawals, and game rules.</p>
            <div className="space-y-2">
              <a
                href="https://t.me/"
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-700 hover:brightness-110 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md border border-white/20"
              >
                Official Telegram Support
              </a>
              <button
                type="button"
                onClick={() => {
                  showToast('💬 Connecting to Live Chat Agent…');
                  setActiveModal(null);
                }}
                className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-black text-xs uppercase tracking-wider transition-all cursor-pointer border border-white/10"
              >
                Start Instant Live Chat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: Logout Confirmation */}
      {activeModal === 'logout' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="rounded-3xl p-6 border-2 border-red-500/40 bg-[#1C0202] max-w-xs w-full shadow-2xl text-center">
            <h3 className="font-black text-white text-base mb-1">Confirm Log Out</h3>
            <p className="text-xs text-white/60 mb-5">Are you sure you want to log out of Breeww?</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 text-white/70 font-black text-xs uppercase hover:bg-white/20 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:brightness-110 text-white font-black text-xs uppercase shadow-md active:scale-95 transition-all cursor-pointer border border-white/30"
              >
                {loggingOut ? 'Logging out…' : 'Log Out'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Account;
