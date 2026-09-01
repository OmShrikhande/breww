import React, { useState } from 'react';
import {
  Users,
  Share2,
  Copy,
  CheckCheck,
  TrendingUp,
  DollarSign,
  Award,
  ChevronRight,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Gift,
  ArrowRight,
  Coins,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../hooks/useWallet';
import { useAudio } from '../context/AudioContext';
import { formatINR } from '../utils/formatCurrency';
import { navigateTo } from '../lib/navigation';

const SUBORDINATES = [
  { phone: '98***120', date: '2026-09-01', turnover: 4500, comm: 31.5, status: 'Active' },
  { phone: '91***482', date: '2026-08-31', turnover: 12000, comm: 84.0, status: 'Active' },
  { phone: '97***339', date: '2026-08-31', turnover: 2500, comm: 17.5, status: 'Active' },
  { phone: '99***810', date: '2026-08-30', turnover: 8400, comm: 58.8, status: 'Active' },
  { phone: '93***661', date: '2026-08-29', turnover: 15000, comm: 105.0, status: 'Active' },
];

const COMMISSION_TIERS = [
  { tier: 'Tier 1 (Direct)', rate: '0.7%', desc: 'Direct invited members bets', color: 'text-amber-400' },
  { tier: 'Tier 2 (Sub-level)', rate: '0.3%', desc: 'Subordinates invited by your members', color: 'text-sky-400' },
  { tier: 'Tier 3 (Team)', rate: '0.1%', desc: '3rd level team network turnover', color: 'text-purple-400' },
];

const SALARY_LEVELS = [
  { members: '5 Active Members', daily: 300, monthly: 9000 },
  { members: '10 Active Members', daily: 800, monthly: 24000 },
  { members: '30 Active Members', daily: 2500, monthly: 75000 },
  { members: '100 Active Members', daily: 10000, monthly: 300000 },
];

const Promotion = () => {
  const { user, isAuthenticated } = useAuth();
  const { balance, setBalance } = useWallet();
  const { playWin, playChip } = useAudio();

  const [activeTab, setActiveTab] = useState('data');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [commissionBalance, setCommissionBalance] = useState(1240);
  const [showQrModal, setShowQrModal] = useState(false);

  const inviteCode = user?.phone ? `BW${user.phone.slice(-4)}` : 'BW9928';
  const inviteLink = `http://localhost:5173/register?code=${inviteCode}`;

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleCopyCode = () => {
    playChip();
    navigator.clipboard?.writeText(inviteCode);
    setCopiedCode(true);
    showToast('📋 Invitation Code copied to clipboard!');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    playChip();
    navigator.clipboard?.writeText(inviteLink);
    setCopiedLink(true);
    showToast('🔗 Referral Link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleTransferCommission = () => {
    if (!isAuthenticated) {
      navigateTo('/login');
      return;
    }
    if (commissionBalance <= 0) {
      showToast('No commission balance available to transfer.');
      return;
    }

    playWin();
    const transferred = commissionBalance;
    setBalance((prev) => prev + transferred);
    setCommissionBalance(0);
    showToast(`🎉 +${formatINR(transferred)} Commission transferred directly to your Main Wallet!`);
  };

  return (
    <div className="pb-24 px-3 sm:px-4 pt-2 relative select-none animate-fadeIn">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-white px-5 py-2.5 rounded-full text-xs font-black shadow-2xl flex items-center gap-2 max-w-[90%] text-center animate-bounce">
          <CheckCircle2 size={16} /> {toastMessage}
        </div>
      )}

      {/* Hero Agency Banner */}
      <div className="relative rounded-3xl p-5 sm:p-6 mb-4 overflow-hidden border border-casino-gold/30 bg-gradient-to-br from-[#121b33] via-[#0d1424] to-[#1e1333] shadow-2xl">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-casino-gold/15 border border-casino-gold/30 text-casino-gold text-[10px] font-black uppercase tracking-widest mb-2">
            <Users size={12} /> Breeww Agent Program
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
            Invite Friends & Earn Unlimited Commission
          </h1>
          <p className="text-xs text-white/60 mt-1 max-w-sm">
            Earn up to 0.7% real-time commission on all team betting turnover across 3 levels!
          </p>

          {/* Quick Stats 4-Card Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4">
            <div className="bg-black/40 border border-white/10 rounded-2xl p-2.5 text-center">
              <span className="text-[9px] font-bold text-white/50 uppercase block">Total Commission</span>
              <span className="text-sm sm:text-base font-black text-casino-gold font-mono">₹14,850</span>
            </div>
            <div className="bg-black/40 border border-white/10 rounded-2xl p-2.5 text-center">
              <span className="text-[9px] font-bold text-white/50 uppercase block">Yesterday Earnings</span>
              <span className="text-sm sm:text-base font-black text-emerald-400 font-mono">₹1,240</span>
            </div>
            <div className="bg-black/40 border border-white/10 rounded-2xl p-2.5 text-center">
              <span className="text-[9px] font-bold text-white/50 uppercase block">Direct Team</span>
              <span className="text-sm sm:text-base font-black text-white font-mono">28</span>
            </div>
            <div className="bg-black/40 border border-white/10 rounded-2xl p-2.5 text-center">
              <span className="text-[9px] font-bold text-white/50 uppercase block">Total Network</span>
              <span className="text-sm sm:text-base font-black text-sky-400 font-mono">114</span>
            </div>
          </div>
        </div>
      </div>

      {/* Commission Transfer Card */}
      <div className="game-glass rounded-2xl p-4 border border-emerald-500/30 bg-[#0d1424]/90 shadow-xl flex items-center justify-between gap-3 mb-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">Available Commission</span>
          <div className="text-xl sm:text-2xl font-black text-white font-mono">{formatINR(commissionBalance)}</div>
        </div>
        <button
          type="button"
          disabled={commissionBalance <= 0}
          onClick={handleTransferCommission}
          className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-lg transition-all active:scale-95 cursor-pointer ${
            commissionBalance > 0
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-emerald-500/30'
              : 'bg-white/10 text-white/40 cursor-not-allowed'
          }`}
        >
          Transfer to Wallet
        </button>
      </div>

      {/* Invitation Link & Code Card */}
      <div className="game-glass rounded-3xl p-4 sm:p-5 border border-white/10 bg-[#0d1424]/90 shadow-xl mb-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-white text-xs sm:text-sm uppercase tracking-wider flex items-center gap-1.5">
            <Share2 size={15} className="text-casino-gold" /> Your Invitation Assets
          </h3>
          <button
            type="button"
            onClick={() => setShowQrModal(true)}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 transition-colors cursor-pointer text-[10px] font-bold flex items-center gap-1"
          >
            <QrCode size={13} /> QR Code
          </button>
        </div>

        {/* Code & Link Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* Invite Code */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/50 border border-white/10">
            <div>
              <span className="text-[9px] font-bold uppercase text-white/40 block">Invite Code</span>
              <span className="text-sm font-black font-mono text-casino-gold">{inviteCode}</span>
            </div>
            <button
              type="button"
              onClick={handleCopyCode}
              className="px-3 py-1.5 rounded-lg bg-casino-gold/15 border border-casino-gold/30 text-casino-gold hover:bg-casino-gold/25 transition-all text-xs font-black uppercase flex items-center gap-1 cursor-pointer"
            >
              {copiedCode ? <CheckCheck size={13} /> : <Copy size={13} />}
              <span>{copiedCode ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Invite Link */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/50 border border-white/10">
            <div className="min-w-0 pr-2">
              <span className="text-[9px] font-bold uppercase text-white/40 block">Invite Link</span>
              <span className="text-xs font-mono text-white/80 truncate block">{inviteLink}</span>
            </div>
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 transition-all text-xs font-black uppercase flex items-center gap-1 shrink-0 cursor-pointer"
            >
              {copiedLink ? <CheckCheck size={13} /> : <Copy size={13} />}
              <span>{copiedLink ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Social Share Buttons */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          <a
            href={`https://api.whatsapp.com/send?text=Join%20me%20on%20Breeww%20Casino%20and%20claim%20free%20welcome%20bonus!%20${encodeURIComponent(inviteLink)}`}
            target="_blank"
            rel="noreferrer"
            className="py-2 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            WhatsApp
          </a>
          <a
            href={`https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=Play%20Aviator%20%26%20WinGo%20on%20Breeww!`}
            target="_blank"
            rel="noreferrer"
            className="py-2 px-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-black text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            Telegram
          </a>
          <button
            type="button"
            onClick={handleCopyLink}
            className="py-2 px-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
          >
            Share Link
          </button>
        </div>
      </div>

      {/* Tabs: Subordinate Data, Commission Tiers, Salary Rules */}
      <div className="flex bg-[#0d1424]/90 p-1.5 rounded-2xl border border-white/10 mb-4 gap-1">
        {[
          { id: 'data', label: 'My Subordinates' },
          { id: 'tiers', label: 'Commission Tiers' },
          { id: 'salary', label: 'Daily Salary' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              playChip();
              setActiveTab(t.id);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === t.id
                ? 'bg-gradient-to-r from-casino-gold/30 via-casino-gold/20 to-orange-500/20 text-casino-gold border border-casino-gold/40 shadow-sm'
                : 'text-white/40 hover:text-white/70'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: Subordinates Table */}
      {activeTab === 'data' && (
        <div className="game-glass rounded-2xl border border-white/10 overflow-hidden shadow-xl animate-fadeIn">
          <div className="p-3 border-b border-white/10 bg-black/40 flex items-center justify-between">
            <span className="text-xs font-black uppercase text-white tracking-wider">Subordinate Betting Activity</span>
            <span className="text-[10px] font-mono text-casino-gold font-bold">5 Active Players</span>
          </div>
          <div className="overflow-x-auto custom-scrollbar max-h-56">
            <table className="w-full text-center text-xs">
              <thead>
                <tr className="text-white/40 font-bold bg-black/50 text-[9px] uppercase tracking-wider sticky top-0 backdrop-blur-md">
                  <th className="py-2 px-2">Member</th>
                  <th className="py-2 px-2">Date</th>
                  <th className="py-2 px-2">Turnover</th>
                  <th className="py-2 px-2">Your Comm</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {SUBORDINATES.map((s, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="py-2 px-2 font-mono text-white/70">{s.phone}</td>
                    <td className="py-2 px-2 text-[10px] text-white/40">{s.date}</td>
                    <td className="py-2 px-2 font-mono font-bold text-white">{formatINR(s.turnover)}</td>
                    <td className="py-2 px-2 font-mono font-black text-emerald-400">+{formatINR(s.comm)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Commission Tiers */}
      {activeTab === 'tiers' && (
        <div className="space-y-3 animate-fadeIn">
          {COMMISSION_TIERS.map((t, idx) => (
            <div
              key={idx}
              className="game-glass rounded-2xl p-4 border border-white/10 bg-[#0d1424]/90 flex items-center justify-between shadow-lg"
            >
              <div>
                <h4 className={`font-black text-sm ${t.color}`}>{t.tier}</h4>
                <p className="text-[11px] text-white/50 mt-0.5">{t.desc}</p>
              </div>
              <div className="text-right">
                <span className="text-base sm:text-lg font-black text-white font-mono">{t.rate}</span>
                <span className="text-[9px] text-white/40 uppercase block">Rebate</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: Daily Agent Salary Table */}
      {activeTab === 'salary' && (
        <div className="space-y-3 animate-fadeIn">
          <div className="game-glass rounded-2xl p-3.5 border border-casino-gold/30 bg-black/40 text-center mb-2">
            <span className="text-[10px] font-black uppercase text-casino-gold tracking-widest block">
              Official Agent Salary System
            </span>
            <p className="text-xs text-white/70 mt-1">
              Maintain active team subordinates to receive automatic daily fixed salary payouts!
            </p>
          </div>

          {SALARY_LEVELS.map((s, idx) => (
            <div
              key={idx}
              className="game-glass rounded-2xl p-3.5 border border-white/10 bg-[#0d1424]/90 flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-casino-gold/15 border border-casino-gold/30 flex items-center justify-center text-sm">
                  💼
                </div>
                <div>
                  <h4 className="font-black text-xs sm:text-sm text-white">{s.members}</h4>
                  <p className="text-[10px] text-white/40">Monthly: ~{formatINR(s.monthly)}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm sm:text-base font-black text-emerald-400 font-mono">
                  {formatINR(s.daily)}/day
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="game-glass rounded-3xl p-6 border border-casino-gold/40 bg-[#0d1424] max-w-xs w-full text-center shadow-2xl">
            <h3 className="font-black text-white text-base mb-1">Invitation QR Code</h3>
            <p className="text-xs text-white/50 mb-4">Scan with camera to register</p>
            <div className="bg-white p-4 rounded-2xl w-44 h-44 mx-auto flex items-center justify-center shadow-inner">
              <QrCode size={130} className="text-slate-950" />
            </div>
            <p className="text-xs font-mono font-black text-casino-gold mt-3">Code: {inviteCode}</p>
            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="w-full mt-5 py-2.5 rounded-xl bg-white/10 text-white font-black text-xs uppercase tracking-wider hover:bg-white/20 transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Promotion;
