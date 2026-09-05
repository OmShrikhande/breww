import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Zap,
  Sparkles,
  ChevronRight,
  Clock,
  Trophy,
  Flame,
  Coins,
  Crown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../hooks/useWallet';
import { useAudio } from '../context/AudioContext';
import { formatINR } from '../utils/formatCurrency';
import { navigateTo } from '../lib/navigation';

const ATTENDANCE_DAYS = [
  { day: 1, reward: 10, claimed: false, label: 'Day 1', isToday: true },
  { day: 2, reward: 20, claimed: false, label: 'Day 2' },
  { day: 3, reward: 50, claimed: false, label: 'Day 3' },
  { day: 4, reward: 80, claimed: false, label: 'Day 4' },
  { day: 5, reward: 120, claimed: false, label: 'Day 5' },
  { day: 6, reward: 200, claimed: false, label: 'Day 6' },
  { day: 7, reward: 500, claimed: false, label: 'Day 7', isMega: true },
];

const DAILY_MISSIONS = [
  {
    id: 'm1',
    title: 'Aviator High Flyer',
    desc: 'Play 5 rounds of Aviator',
    reward: 25,
    progress: 0,
    total: 5,
    completed: false,
    gamePath: '/game/aviator',
    icon: Flame,
    color: 'text-red-400 bg-red-500/20 border-red-500/40',
  },
  {
    id: 'm2',
    title: 'Colour Prediction Master',
    desc: 'Place 3 winning bets on Colour Prediction',
    reward: 50,
    progress: 0,
    total: 3,
    completed: false,
    gamePath: '/game/color-prediction',
    icon: Sparkles,
    color: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/40',
  },
  {
    id: 'm3',
    title: 'Mines Emerald Seeker',
    desc: 'Cash out in 3 Mines games with 2+ gems',
    reward: 40,
    progress: 0,
    total: 3,
    completed: false,
    gamePath: '/game/mines',
    icon: Coins,
    color: 'text-amber-400 bg-amber-500/20 border-amber-500/40',
  },
  {
    id: 'm4',
    title: 'Dragon Tiger Clash',
    desc: 'Play 10 rounds of Dragon Tiger',
    reward: 35,
    progress: 0,
    total: 10,
    completed: false,
    gamePath: '/game/dragon-tiger',
    icon: Trophy,
    color: 'text-purple-400 bg-purple-500/20 border-purple-500/40',
  },
];

const VIP_LEVELS = [
  { level: 'VIP 1', minExp: 0, rebate: '0.6%', levelBonus: 50, monthly: 100, current: true },
  { level: 'VIP 2', minExp: 1000, rebate: '0.7%', levelBonus: 150, monthly: 300 },
  { level: 'VIP 3', minExp: 5000, rebate: '0.85%', levelBonus: 500, monthly: 1000 },
  { level: 'VIP 4', minExp: 20000, rebate: '1.0%', levelBonus: 2000, monthly: 3500 },
  { level: 'VIP 5', minExp: 100000, rebate: '1.2%', levelBonus: 10000, monthly: 15000 },
];

const Activity = () => {
  const { isAuthenticated } = useAuth();
  const { balance, setBalance } = useWallet();
  const { playWin, playChip } = useAudio();

  const [activeTab, setActiveTab] = useState('attendance');
  const [toastMessage, setToastMessage] = useState('');
  const [claimedDays, setClaimedDays] = useState({});
  const [claimedMissions, setClaimedMissions] = useState({});
  const [rebateClaimed, setRebateClaimed] = useState(false);
  const [rebateAmount, setRebateAmount] = useState(0);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleCheckIn = (day, reward) => {
    if (!isAuthenticated) {
      navigateTo('/login');
      return;
    }
    if (claimedDays[day]) return;

    playWin();
    setClaimedDays((prev) => ({ ...prev, [day]: true }));
    setBalance((prev) => prev + reward);
    showToast(`🎉 Attendance Check-in Successful! +${formatINR(reward)} added to your wallet!`);
  };

  const handleClaimMission = (mission) => {
    if (!isAuthenticated) {
      navigateTo('/login');
      return;
    }
    if (claimedMissions[mission.id]) return;

    if (!mission.completed) {
      navigateTo(mission.gamePath);
      return;
    }

    playWin();
    setClaimedMissions((prev) => ({ ...prev, [mission.id]: true }));
    setBalance((prev) => prev + mission.reward);
    showToast(`🎁 Mission Reward Claimed! +${formatINR(mission.reward)} credited!`);
  };

  const handleClaimRebate = () => {
    if (!isAuthenticated) {
      navigateTo('/login');
      return;
    }
    if (rebateClaimed || rebateAmount <= 0) return;

    playWin();
    setRebateClaimed(true);
    setBalance((prev) => prev + rebateAmount);
    showToast(`💰 Real-Time Betting Rebate of +${formatINR(rebateAmount)} credited to your wallet!`);
    setRebateAmount(0);
  };

  return (
    <div className="pb-24 px-3 sm:px-4 pt-2 relative select-none animate-fadeIn">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#1C0202] border-2 border-amber-400 text-amber-200 px-5 py-2.5 rounded-full text-xs font-black shadow-2xl flex items-center gap-2 max-w-[90%] text-center animate-bounce">
          <CheckCircle2 size={16} className="text-amber-400" /> {toastMessage}
        </div>
      )}

      {/* Hero Banner (Tiranga / Big Mumbai / 1Win Style) */}
      <div className="relative rounded-3xl p-5 sm:p-6 mb-4 overflow-hidden border-2 border-amber-500/40 bg-gradient-to-br from-[#8B0000] via-[#450505] to-[#180202] shadow-2xl">
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] font-black uppercase tracking-widest mb-2">
              <Crown size={12} /> Activity Award Center
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
              Rewards, Tasks & VIP Rebates
            </h1>
            <p className="text-xs text-amber-100/70 mt-1 max-w-sm">
              Complete daily attendance, quests & claim real-time betting rebates every day!
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => navigateTo('/invite-wheel')}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-red-950 font-black text-xs uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer border-2 border-white/80"
            >
              <Sparkles size={14} /> Lucky Spin (Get ₹500)
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex bg-[#180202]/95 p-1.5 rounded-2xl border border-amber-500/30 mb-4 gap-1 overflow-x-auto custom-scrollbar shadow-md">
        {[
          { id: 'attendance', label: '7-Day Check-in', icon: Calendar },
          { id: 'missions', label: 'Mission Center', icon: Zap },
          { id: 'rebate', label: 'Betting Rebate', icon: Coins },
          { id: 'vip', label: 'VIP Privileges', icon: Crown },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              playChip();
              setActiveTab(t.id);
            }}
            className={`flex-1 min-w-[100px] py-2 px-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === t.id
                ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-red-950 border border-white/80 shadow-md font-black'
                : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <t.icon size={14} className={activeTab === t.id ? 'text-red-950' : 'text-amber-400'} />
            <span className="truncate">{t.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: 7-Day Attendance Check-in */}
      {activeTab === 'attendance' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="rounded-3xl p-4 sm:p-5 border border-amber-500/30 bg-[#1C0202]/95 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-black text-white text-sm sm:text-base uppercase tracking-wide flex items-center gap-1.5">
                  <Calendar size={16} className="text-amber-400" /> 7-Day Continuous Check-in
                </h3>
                <p className="text-[11px] text-amber-200/60">Check in every day to claim up to ₹1,000 bonus!</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase">
                Streak: {Object.keys(claimedDays).length} Days
              </span>
            </div>

            {/* 7 Days Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 my-4">
              {ATTENDANCE_DAYS.map((d) => {
                const isClaimed = claimedDays[d.day];
                return (
                  <div
                    key={d.day}
                    className={`rounded-2xl p-2.5 flex flex-col items-center justify-between text-center border relative transition-all ${
                      isClaimed
                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                        : d.isToday
                          ? 'bg-amber-500/20 border-2 border-amber-400 shadow-[0_0_15px_rgba(255,215,0,0.4)]'
                          : 'bg-black/50 border-white/10 text-white/70'
                    }`}
                  >
                    {d.isMega && (
                      <span className="absolute -top-2 bg-gradient-to-r from-red-500 to-amber-500 text-white text-[8px] font-black px-1.5 py-0.2 rounded-full uppercase border border-white/40 shadow">
                        Mega Box
                      </span>
                    )}
                    <span className="text-[10px] font-bold opacity-75">{d.label}</span>
                    <div className="my-1 text-base sm:text-lg">
                      {isClaimed ? '✅' : d.isMega ? '🎁' : '🪙'}
                    </div>
                    <span className="text-xs font-black font-mono text-amber-300">
                      +{formatINR(d.reward)}
                    </span>
                    <button
                      type="button"
                      disabled={isClaimed || !d.isToday}
                      onClick={() => handleCheckIn(d.day, d.reward)}
                      className={`w-full mt-1.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                        isClaimed
                          ? 'bg-emerald-500/20 text-emerald-400 cursor-default'
                          : d.isToday
                            ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-red-950 hover:brightness-110 active:scale-95 shadow-md border border-white/60 font-black'
                            : 'bg-white/5 text-white/30 cursor-not-allowed'
                      }`}
                    >
                      {isClaimed ? 'Done' : d.isToday ? 'Claim' : 'Locked'}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="p-3 rounded-2xl bg-black/50 border border-white/5 flex items-center justify-between text-xs">
              <span className="text-white/60">Current Wallet Balance:</span>
              <span className="font-black text-amber-400 font-mono">{formatINR(balance)}</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Mission Award Center */}
      {activeTab === 'missions' && (
        <div className="space-y-3 animate-fadeIn">
          {DAILY_MISSIONS.map((m) => {
            const isClaimed = claimedMissions[m.id];
            return (
              <div
                key={m.id}
                className="rounded-2xl p-3.5 sm:p-4 border border-amber-500/25 bg-[#1C0202]/95 shadow-xl flex items-center justify-between gap-3 hover:border-amber-400/40 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${m.color}`}>
                    <m.icon size={22} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-white text-xs sm:text-sm truncate">{m.title}</h4>
                      <span className="text-[10px] font-black font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                        +{formatINR(m.reward)}
                      </span>
                    </div>
                    <p className="text-[11px] text-white/50 truncate mt-0.5">{m.desc}</p>
                    
                    {/* Progress Bar */}
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="w-24 sm:w-32 h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/10">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 transition-all duration-500"
                          style={{ width: `${Math.min(100, (m.progress / m.total) * 100)}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono font-bold text-amber-300/80">
                        {m.progress}/{m.total}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isClaimed}
                  onClick={() => handleClaimMission(m)}
                  className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider shrink-0 transition-all shadow-md active:scale-95 cursor-pointer ${
                    isClaimed
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-default'
                      : m.completed
                        ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-emerald-500/30 border border-white/40'
                        : 'bg-white/10 text-white/80 hover:bg-white/20 border border-white/10'
                  }`}
                >
                  {isClaimed ? 'Claimed' : m.completed ? 'Claim' : 'Play'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: Betting Rebate */}
      {activeTab === 'rebate' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="rounded-3xl p-5 border-2 border-amber-500/40 bg-[#1C0202]/95 shadow-2xl text-center relative overflow-hidden">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-black uppercase tracking-wider mb-2">
              <Coins size={12} /> Real-Time Bet Rebate Engine
            </div>

            <p className="text-xs text-amber-200/60 mb-1 font-medium">Accumulated Unclaimed Rebate</p>
            <div className="text-3xl sm:text-4xl font-black text-amber-400 font-mono tracking-tight my-2 drop-shadow">
              {formatINR(rebateAmount)}
            </div>
            <p className="text-[11px] text-white/50 max-w-sm mx-auto mb-4">
              Rebate rate: <span className="text-emerald-400 font-bold">0.7%</span> · Rebate is calculated on all live game bets automatically.
            </p>

            <button
              type="button"
              disabled={rebateClaimed || rebateAmount <= 0}
              onClick={handleClaimRebate}
              className={`w-full max-w-xs mx-auto py-3 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider shadow-xl transition-all active:scale-95 cursor-pointer ${
                rebateClaimed || rebateAmount <= 0
                  ? 'bg-white/10 text-white/30 border border-white/10 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-red-950 hover:brightness-110 shadow-[0_0_20px_rgba(255,215,0,0.4)] border-2 border-white/80'
              }`}
            >
              {rebateClaimed || rebateAmount <= 0 ? 'No Rebate Available' : '⚡ One-Click Claim Rebate'}
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: VIP Privileges */}
      {activeTab === 'vip' && (
        <div className="space-y-3 animate-fadeIn">
          <div className="rounded-2xl p-4 border border-amber-500/40 bg-[#1C0202]/95 flex items-center justify-between mb-2 shadow-lg">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">Your Status</span>
              <h3 className="text-base sm:text-lg font-black text-white">VIP 1 Bronze</h3>
              <p className="text-[11px] text-amber-200/60">Exp: 0 / 1,000</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-2xl shadow-inner">
              👑
            </div>
          </div>

          {VIP_LEVELS.map((v) => (
            <div
              key={v.level}
              className={`rounded-2xl p-3.5 border transition-all ${
                v.current
                  ? 'border-amber-400 bg-amber-500/15 shadow-[0_0_15px_rgba(255,215,0,0.3)]'
                  : 'border-amber-500/20 bg-[#180202]/90'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Crown size={16} className={v.current ? 'text-amber-400' : 'text-white/40'} />
                  <h4 className="font-black text-sm text-white">{v.level}</h4>
                  {v.current && (
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400 text-red-950">
                      Current
                    </span>
                  )}
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {v.rebate} Rebate
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-white/60 bg-black/40 p-2 rounded-xl border border-white/5">
                <div>Level Bonus: <span className="font-black text-amber-300 font-mono">{formatINR(v.levelBonus)}</span></div>
                <div>Monthly Reward: <span className="font-black text-amber-300 font-mono">{formatINR(v.monthly)}</span></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Activity;
