import React, { useState } from 'react';
import {
  Users,
  Share2,
  Copy,
  CheckCheck,
  TrendingUp,
  QrCode,
  CheckCircle2,
  Gift,
  Coins,
  Sparkles,
  MessageCircle,
  Send,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../hooks/useWallet';
import { useAudio } from '../context/AudioContext';
import { formatINR } from '../utils/formatCurrency';
import { getReferralUrl } from '../utils/referral';
import { navigateTo } from '../lib/navigation';
import QRCodeView from '../components/common/QRCodeView';

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

  const inviteCode = user?.inviteCode || (user?.phone ? `BW${user.phone.slice(-4)}` : 'BW9928');
  const inviteLink = getReferralUrl(inviteCode);

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
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#1C0202] border-2 border-amber-400 text-amber-200 px-5 py-2.5 rounded-full text-xs font-black shadow-2xl flex items-center gap-2 max-w-[90%] text-center animate-bounce">
          <CheckCircle2 size={16} className="text-amber-400" /> {toastMessage}
        </div>
      )}

      {/* Hero Agency Banner */}
      <div className="relative rounded-3xl p-5 sm:p-6 mb-4 overflow-hidden border-2 border-amber-500/40 bg-gradient-to-br from-[#8B0000] via-[#450505] to-[#180202] shadow-2xl">
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] font-black uppercase tracking-widest mb-2">
            <Users size={12} /> Breeww Agent Program
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
            Invite Friends & Earn Unlimited Commission
          </h1>
          <p className="text-xs text-amber-100/70 mt-1 max-w-sm">
            Earn up to 0.7% real-time commission on all team betting turnover across 3 levels!
          </p>

          {/* Quick Stats 4-Card Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4">
            <div className="bg-black/50 border border-amber-500/20 rounded-2xl p-2.5 text-center shadow-inner">
              <span className="text-[9px] font-bold text-amber-300/60 uppercase block">Total Commission</span>
              <span className="text-sm sm:text-base font-black text-amber-400 font-mono">₹14,850</span>
            </div>
            <div className="bg-black/50 border border-amber-500/20 rounded-2xl p-2.5 text-center shadow-inner">
              <span className="text-[9px] font-bold text-amber-300/60 uppercase block">Yesterday Earnings</span>
              <span className="text-sm sm:text-base font-black text-emerald-400 font-mono">₹1,240</span>
            </div>
            <div className="bg-black/50 border border-amber-500/20 rounded-2xl p-2.5 text-center shadow-inner">
              <span className="text-[9px] font-bold text-amber-300/60 uppercase block">Direct Team</span>
              <span className="text-sm sm:text-base font-black text-white font-mono">28</span>
            </div>
            <div className="bg-black/50 border border-amber-500/20 rounded-2xl p-2.5 text-center shadow-inner">
              <span className="text-[9px] font-bold text-amber-300/60 uppercase block">Total Network</span>
              <span className="text-sm sm:text-base font-black text-amber-300 font-mono">114</span>
            </div>
          </div>
        </div>
      </div>

      {/* Commission Transfer Card */}
      <div className="rounded-2xl p-4 border border-amber-500/30 bg-[#1C0202]/95 shadow-xl flex items-center justify-between gap-3 mb-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">Available Commission</span>
          <div className="text-xl sm:text-2xl font-black text-white font-mono">{formatINR(commissionBalance)}</div>
        </div>
        <button
          type="button"
          disabled={commissionBalance <= 0}
          onClick={handleTransferCommission}
          className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-lg transition-all active:scale-95 cursor-pointer ${
            commissionBalance > 0
              ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-emerald-500/30 border border-white/30'
              : 'bg-white/10 text-white/40 cursor-not-allowed'
          }`}
        >
          Transfer to Wallet
        </button>
      </div>

      {/* Invitation Link & Code Card */}
      <div className="rounded-3xl p-4 sm:p-5 border border-amber-500/30 bg-[#1C0202]/95 shadow-xl mb-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-white text-xs sm:text-sm uppercase tracking-wider flex items-center gap-1.5">
            <Share2 size={15} className="text-amber-400" /> Your Invitation Assets
          </h3>
          <button
            type="button"
            onClick={() => setShowQrModal(true)}
            className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-colors cursor-pointer text-[10px] font-bold flex items-center gap-1"
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
              <span className="text-sm font-black font-mono text-amber-300">{inviteCode}</span>
            </div>
            <button
              type="button"
              onClick={handleCopyCode}
              className="px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-400/40 text-amber-300 hover:bg-amber-500/30 transition-all text-xs font-black uppercase flex items-center gap-1 cursor-pointer active:scale-95"
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
              className="px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-400/40 text-amber-300 hover:bg-amber-500/30 transition-all text-xs font-black uppercase flex items-center gap-1 shrink-0 cursor-pointer active:scale-95"
            >
              {copiedLink ? <CheckCheck size={13} /> : <Copy size={13} />}
              <span>{copiedLink ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Social Share Buttons */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          <a
            href={`https://api.whatsapp.com/send?text=Join%20me%20on%20Breeww%20and%20spin%20the%20Invite%20Wheel%20to%20withdraw%20%E2%82%B9500%20free!%20${encodeURIComponent(inviteLink)}`}
            target="_blank"
            rel="noreferrer"
            className="py-2.5 px-2 rounded-xl bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:brightness-110 text-white font-black text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            <MessageCircle size={14} className="fill-current" /> WhatsApp
          </a>
          <a
            href={`https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=Play%20Aviator%20%26%20WinGo%20on%20Breeww!`}
            target="_blank"
            rel="noreferrer"
            className="py-2.5 px-2 rounded-xl bg-gradient-to-r from-[#0088CC] to-[#006699] hover:brightness-110 text-white font-black text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            <Send size={14} /> Telegram
          </a>
          <button
            type="button"
            onClick={handleCopyLink}
            className="py-2.5 px-2 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-red-950 font-black text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer border border-white/60"
          >
            Share Link
          </button>
        </div>
      </div>

      {/* Tabs: Subordinate Data, Commission Tiers, Salary Rules */}
      <div className="flex bg-[#180202]/95 p-1.5 rounded-2xl border border-amber-500/30 mb-4 gap-1 shadow-md">
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
                ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-red-950 border border-white/80 shadow-md font-black'
                : 'text-white/60 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: Subordinates Table */}
      {activeTab === 'data' && (
        <div className="rounded-2xl border border-amber-500/30 bg-[#1C0202]/95 overflow-hidden shadow-xl animate-fadeIn">
          <div className="p-3 border-b border-amber-500/20 bg-black/40 flex items-center justify-between">
            <span className="text-xs font-black uppercase text-white tracking-wider">Subordinate Betting Activity</span>
            <span className="text-[10px] font-mono text-amber-400 font-bold">5 Active Players</span>
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
              className="rounded-2xl p-4 border border-amber-500/30 bg-[#1C0202]/95 flex items-center justify-between shadow-lg"
            >
              <div>
                <h4 className={`font-black text-sm ${t.color}`}>{t.tier}</h4>
                <p className="text-[11px] text-white/50 mt-0.5">{t.desc}</p>
              </div>
              <div className="text-right">
                <span className="text-base sm:text-lg font-black text-white font-mono">{t.rate}</span>
                <span className="text-[9px] text-amber-300/60 uppercase block">Rebate</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: Daily Agent Salary Table */}
      {activeTab === 'salary' && (
        <div className="space-y-3 animate-fadeIn">
          <div className="rounded-2xl p-3.5 border border-amber-500/30 bg-black/40 text-center mb-2">
            <span className="text-[10px] font-black uppercase text-amber-400 tracking-widest block">
              Official Agent Salary System
            </span>
            <p className="text-xs text-white/70 mt-1">
              Maintain active team subordinates to receive automatic daily fixed salary payouts!
            </p>
          </div>

          {SALARY_LEVELS.map((s, idx) => (
            <div
              key={idx}
              className="rounded-2xl p-3.5 border border-amber-500/20 bg-[#1C0202]/95 flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-sm">
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
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="rounded-3xl p-6 border-2 border-amber-500/40 bg-[#1C0202] max-w-xs w-full text-center shadow-2xl animate-modalPop text-white">
            <h3 className="font-black text-amber-300 text-base mb-1 uppercase tracking-wider">Official Invitation QR</h3>
            <p className="text-xs text-white/50 mb-3">Scan with any camera or scanner to join</p>

            <div className="my-4">
              <QRCodeView
                value={inviteLink}
                size={190}
                logoText="BW"
                showDownload={true}
              />
            </div>

            <div className="mt-3 py-1.5 px-3 rounded-xl bg-black/60 border border-amber-500/20 flex items-center justify-between">
              <span className="text-[10px] text-white/50 uppercase font-bold">Invite Code</span>
              <span className="text-xs font-mono font-black text-amber-400">{inviteCode}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4">
              <button
                type="button"
                onClick={handleCopyLink}
                className="py-2.5 px-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-red-950 font-black text-[11px] uppercase tracking-wider flex items-center justify-center gap-1 shadow-md cursor-pointer border border-white/60 active:scale-95"
              >
                {copiedLink ? <CheckCheck size={13} /> : <Copy size={13} />}
                <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
              </button>
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="py-2.5 px-2 rounded-xl bg-white/10 text-white font-black text-[11px] uppercase tracking-wider hover:bg-white/20 transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Promotion;
