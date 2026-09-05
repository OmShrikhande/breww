import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  HelpCircle,
  FileText,
  Copy,
  X,
  Share2,
  Sparkles,
  Trophy,
  Gift,
  Zap,
  Users,
  Flame,
  Volume2,
  VolumeX,
  QrCode,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Send,
  MessageCircle,
  TrendingUp,
  Coins
} from 'lucide-react';
import { goBackOr, navigateTo } from '../lib/navigation';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../hooks/useWallet';
import { getReferralUrl } from '../utils/referral';
import { soundFX } from '../utils/audioFx';
import QRCodeView from '../components/common/QRCodeView';

const PRIZES = [
  { id: 0, value: 500, label: '₹500', subtext: 'JACKPOT', color1: '#FFD700', color2: '#FF8C00', textColor: '#8B0000', isJackpot: true, icon: '👑' },
  { id: 1, value: 80, label: '₹80', subtext: 'Cash', color1: '#10B981', color2: '#059669', textColor: '#FFFFFF', isJackpot: false, icon: '💵' },
  { id: 2, value: 20, label: '₹20', subtext: 'Bonus', color1: '#8B5CF6', color2: '#6D28D9', textColor: '#FFFFFF', isJackpot: false, icon: '🪙' },
  { id: 3, value: 30, label: '₹30', subtext: 'Reward', color1: '#EF4444', color2: '#B91C1C', textColor: '#FFFFFF', isJackpot: false, icon: '💎' },
  { id: 4, value: 50, label: '₹50', subtext: 'Cash', color1: '#3B82F6', color2: '#1D4ED8', textColor: '#FFFFFF', isJackpot: false, icon: '⭐' },
  { id: 5, value: 10, label: '₹10', subtext: 'Coin', color1: '#F59E0B', color2: '#D97706', textColor: '#FFFFFF', isJackpot: false, icon: '🔥' },
  { id: 6, value: 5, label: '₹5', subtext: 'Gift', color1: '#14B8A6', color2: '#0F766E', textColor: '#FFFFFF', isJackpot: false, icon: '🎁' },
  { id: 7, value: 15, label: '₹15', subtext: 'Bonus', color1: '#EC4899', color2: '#BE185D', textColor: '#FFFFFF', isJackpot: false, icon: '✨' },
];

const RECENT_WINNERS = [
  { phone: '98****41', amount: '₹500.00', method: 'IMPS Bank', time: '1m ago', avatar: '🦁' },
  { phone: '87****20', amount: '₹80.00', method: 'Spin Won', time: '2m ago', avatar: '🐯' },
  { phone: '91****99', amount: '₹500.00', method: 'UPI Instant', time: '3m ago', avatar: '🦅' },
  { phone: '70****15', amount: '₹50.00', method: 'Spin Won', time: '4m ago', avatar: '🐺' },
  { phone: '93****84', amount: '₹500.00', method: 'PayTM Bank', time: '5m ago', avatar: '👑' },
  { phone: '89****62', amount: '₹30.00', method: 'Spin Won', time: '7m ago', avatar: '🔥' },
  { phone: '99****07', amount: '₹500.00', method: 'IMPS Bank', time: '8m ago', avatar: '⚡' },
];

const TASKS = [
  { id: 'daily_login', title: 'Daily Check-in Spin', desc: 'Log in today to claim 1 free wheel spin', reward: '+1 Spin', icon: Gift, claimable: true, completed: false },
  { id: 'invite_friend', title: 'Invite 1 Friend', desc: 'Share your link and get a friend to register', reward: '+1 Spin', icon: Users, claimable: false, completed: false },
  { id: 'first_deposit', title: 'Friend 1st Deposit', desc: 'Get +2 extra spins when friend deposits ₹100+', reward: '+2 Spins', icon: Coins, claimable: false, completed: false },
  { id: 'invite_5', title: 'Invite 5 Friends', desc: 'Unlock Grand Spinner + ₹50 direct cash', reward: '+5 Spins & ₹50', icon: Trophy, claimable: false, completed: false },
];

const InviteWheel = () => {
  const { user, isAuthenticated } = useAuth();
  const { refreshBalance, addWin } = useWallet();

  const storageKey = user?.id ? `invite_wheel_balance_${user.id}` : 'invite_wheel_balance_guest';
  const historyKey = user?.id ? `invite_wheel_history_${user.id}` : 'invite_wheel_history_guest';
  const spinsKey = user?.id ? `invite_wheel_spins_${user.id}` : 'invite_wheel_spins_guest';

  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [currentAmount, setCurrentAmount] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved != null ? Math.max(0, Number(saved)) : 0.00;
  });
  const [availableSpins, setAvailableSpins] = useState(() => {
    const saved = localStorage.getItem(spinsKey);
    return saved != null ? Math.max(0, Number(saved)) : 1;
  });
  const [toastMessage, setToastMessage] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  
  // Modals
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showWinModal, setShowWinModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [lastWinPrize, setLastWinPrize] = useState(null);
  
  // Active tab for history
  const [historyTab, setHistoryTab] = useState('spins');
  const [claimedTasks, setClaimedTasks] = useState({});
  const [spinHistory, setSpinHistory] = useState(() => {
    try {
      const saved = localStorage.getItem(historyKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(storageKey, String(currentAmount));
  }, [currentAmount, storageKey]);

  useEffect(() => {
    localStorage.setItem(spinsKey, String(availableSpins));
  }, [availableSpins, spinsKey]);

  useEffect(() => {
    localStorage.setItem(historyKey, JSON.stringify(spinHistory));
  }, [spinHistory, historyKey]);

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({ hours: 71, minutes: 58, seconds: 45 });

  const inviteCode = user?.inviteCode || (user?.phone ? `BW${user.phone.slice(-4)}` : 'BW9928');
  const inviteUrl = getReferralUrl(inviteCode);
  const targetAmount = 500.00;
  const progressPercent = Math.min(100, Math.max(0, (currentAmount / targetAmount) * 100));

  // Ticking countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 72, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(inviteUrl).then(() => {
      showToast('📋 Referral link copied! Share with friends to unlock more spins.');
    }).catch(() => {
      showToast(`Link: ${inviteUrl}`);
    });
  };

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(inviteCode).then(() => {
      showToast(`📋 Invite Code "${inviteCode}" copied!`);
    }).catch(() => {
      showToast(`Invite Code: ${inviteCode}`);
    });
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `🎁 I just won ₹${currentAmount.toFixed(2)} on Breeww Invite Wheel!\n` +
      `🔥 Spin the wheel & withdraw ₹500 directly to your Bank/UPI.\n` +
      `Use my Invite Code: ${inviteCode}\n` +
      `👉 Join & Spin here: ${inviteUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleTelegramShare = () => {
    const text = encodeURIComponent(
      `🎁 Claim ₹500 Free on Breeww Invite Wheel! Code: ${inviteCode}`
    );
    window.open(`https://t.me/share/url?url=${encodeURIComponent(inviteUrl)}&text=${text}`, '_blank');
  };

  const toggleSound = () => {
    const muted = soundFX.toggleMute();
    setIsMuted(muted);
    showToast(muted ? '🔇 Sound Muted' : '🔊 Sound Enabled');
  };

  const handleClaimTask = (taskId, rewardSpins) => {
    if (claimedTasks[taskId]) return;
    setClaimedTasks(prev => ({ ...prev, [taskId]: true }));
    setAvailableSpins(prev => prev + rewardSpins);
    soundFX.playWinFanfare();
    showToast(`🎉 Claimed +${rewardSpins} Free Spin!`);
  };

  const handleCashout = () => {
    if (!isAuthenticated) {
      navigateTo('/login');
      return;
    }
    if (currentAmount < targetAmount) {
      const remaining = (targetAmount - currentAmount).toFixed(2);
      showToast(`⚠️ You need ₹${remaining} more to cash out ₹500.00! Spin or invite friends.`);
      return;
    }
    
    // Process cashout
    soundFX.playCashout();
    addWin(currentAmount);
    refreshBalance();
    
    setSpinHistory(prev => [
      { id: Date.now(), type: 'Cashout to Wallet', amount: -currentAmount, time: 'Just now', date: 'Today' },
      ...prev
    ]);

    showToast(`🎉 ₹${currentAmount.toFixed(2)} successfully transferred to your Game Wallet!`);
    setCurrentAmount(0);
  };

  const handleSpin = () => {
    if (isSpinning) return;
    if (!isAuthenticated) {
      navigateTo('/login');
      return;
    }
    if (availableSpins <= 0) {
      showToast('⚠️ No spins left! Invite friends or complete daily tasks below to get more spins.');
      return;
    }

    setIsSpinning(true);
    setAvailableSpins(prev => Math.max(0, prev - 1));

    // Choose prize with realistic distribution
    // Bias towards helping user get closer to ₹500
    const remaining = targetAmount - currentAmount;
    let selectedPrize;
    
    if (remaining <= 5) {
      // Land on jackpot if they've reached threshold
      selectedPrize = PRIZES[0];
    } else {
      // Pick dynamic prizes (₹80, ₹50, ₹30, ₹20, ₹15, ₹10, ₹5)
      const nonJackpotPrizes = PRIZES.filter(p => p.value <= remaining);
      const candidates = nonJackpotPrizes.length > 0 ? nonJackpotPrizes : PRIZES;
      selectedPrize = candidates[Math.floor(Math.random() * candidates.length)];
    }

    // Calculate rotation angle
    // Sector size = 360 / 8 = 45 degrees
    // Prize index 0 is at top (0-45), etc.
    const segmentAngle = 360 / PRIZES.length; // 45 deg
    const prizeIndex = PRIZES.findIndex(p => p.id === selectedPrize.id);
    
    // Random offset inside segment (-15 to +15 deg)
    const randomOffset = (Math.random() - 0.5) * (segmentAngle * 0.6);
    
    // To land on index `prizeIndex` at the top pointer (0 deg):
    // Rotation must place the sector at the top
    const targetDeg = (360 - (prizeIndex * segmentAngle)) + randomOffset;
    const fullSpins = 360 * 6; // 6 full revolutions
    const newTotalRotation = rotation + fullSpins + (targetDeg - (rotation % 360));
    
    setRotation(newTotalRotation);

    // Audio tick simulation during spin
    let tickCount = 0;
    const totalTicks = 28;
    const tickInterval = setInterval(() => {
      tickCount++;
      soundFX.playTick(600 + (tickCount * 15));
      if (tickCount >= totalTicks) {
        clearInterval(tickInterval);
      }
    }, 140);

    // Spin animation duration: 4.5 seconds
    setTimeout(() => {
      clearInterval(tickInterval);
      setIsSpinning(false);
      
      const wonAmount = selectedPrize.value;
      const nextAmount = Number((currentAmount + wonAmount).toFixed(2));
      setCurrentAmount(nextAmount);
      setLastWinPrize(selectedPrize);
      setShowWinModal(true);
      soundFX.playWinFanfare();

      setSpinHistory(prev => [
        { id: Date.now(), type: `Wheel Spin (${selectedPrize.label})`, amount: wonAmount, time: 'Just now', date: 'Today' },
        ...prev
      ]);
    }, 4500);
  };

  return (
    <div className="min-h-screen bg-[#070b19] flex justify-center select-none text-white font-sans">
      <div className="w-full max-w-md bg-gradient-to-b from-[#8B0000] via-[#C01515] to-[#450505] relative shadow-2xl flex flex-col min-h-screen pb-16 overflow-x-hidden">
        
        {/* Animated Background Ambience */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,215,0,0.18),transparent_70%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_70%,rgba(255,69,0,0.15),transparent_60%)] pointer-events-none" />

        {/* Top Navbar */}
        <header className="sticky top-0 left-0 right-0 h-14 bg-[#140202]/85 backdrop-blur-md flex items-center justify-between px-4 z-[100] border-b border-amber-500/30 shadow-lg">
          <button
            type="button"
            onClick={() => goBackOr('/')}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center transition-all cursor-pointer border border-white/10"
            aria-label="Back"
          >
            <ChevronLeft size={22} className="text-amber-300" />
          </button>

          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1.5">
              <Sparkles size={16} className="text-amber-400 animate-pulse" />
              <h1 className="text-base font-black uppercase tracking-wider bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-100 bg-clip-text text-transparent drop-shadow">
                INVITE WHEEL
              </h1>
              <Flame size={16} className="text-orange-400 animate-bounce" />
            </div>
            <span className="text-[9px] font-bold text-amber-300/90 tracking-widest uppercase">
              100% Guaranteed Cash Out
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleSound}
              className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-amber-300 transition-colors border border-amber-500/20 cursor-pointer"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <button
              type="button"
              onClick={() => setShowRulesModal(true)}
              className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-amber-300 transition-colors border border-amber-500/20 cursor-pointer"
              title="Rules"
            >
              <HelpCircle size={16} />
            </button>
            <button
              type="button"
              onClick={() => setShowHistoryModal(true)}
              className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-amber-300 transition-colors border border-amber-500/20 cursor-pointer"
              title="History"
            >
              <FileText size={16} />
            </button>
          </div>
        </header>

        {/* Real-Time Live Winner Marquee */}
        <div className="bg-[#2A0505]/95 border-y border-amber-500/20 px-3 py-1.5 flex items-center gap-2 overflow-hidden shadow-inner text-[11px] z-10">
          <div className="flex items-center gap-1 bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 border border-amber-400/30">
            <Flame size={12} className="text-amber-400 animate-pulse" />
            <span>LIVE</span>
          </div>
          <div className="overflow-hidden whitespace-nowrap w-full">
            <div className="inline-block animate-scroll text-amber-200/90 font-medium">
              {RECENT_WINNERS.map((w, idx) => (
                <span key={idx} className="mr-6 inline-flex items-center gap-1">
                  <span>{w.avatar}</span>
                  <span className="font-bold text-white">{w.phone}</span>
                  <span>just won</span>
                  <span className="font-black text-amber-300">{w.amount}</span>
                  <span className="text-white/40">({w.time})</span>
                  <span className="mx-2 text-amber-500/50">•</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[150] bg-[#1a0808]/95 border-2 border-amber-400 text-amber-200 px-5 py-2.5 rounded-full text-xs font-bold shadow-[0_10px_30px_rgba(0,0,0,0.8)] animate-fadeInFast max-w-[90%] text-center flex items-center gap-2 backdrop-blur-md">
            <Sparkles size={14} className="text-amber-400 shrink-0 animate-spin-slow" />
            <span>{toastMessage}</span>
          </div>
        )}

        <main className="flex-1 flex flex-col items-center px-4 pt-3 pb-8">
          
          {/* Jackpot & Progress Target Card */}
          <div className="w-full bg-gradient-to-b from-[#2B0303] to-[#180101] border-2 border-amber-500/40 rounded-3xl p-4 shadow-[0_10px_30px_rgba(0,0,0,0.6)] relative overflow-hidden shrink-0 mt-1">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-red-500/15 rounded-full blur-xl pointer-events-none" />

            {/* Header / Countdown */}
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-1.5 bg-amber-950/60 border border-amber-500/30 px-2.5 py-1 rounded-full text-[10px] text-amber-300 font-bold">
                <Clock size={12} className="text-amber-400" />
                <span>Event Ends in:</span>
                <span className="font-black text-white font-mono">
                  {String(timeLeft.hours).padStart(2, '0')}:
                  {String(timeLeft.minutes).padStart(2, '0')}:
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-black text-amber-400">
                <Trophy size={14} />
                <span>Target: ₹{targetAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Current Amount Display */}
            <div className="text-center my-2">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-300/80">
                My Cashout Balance
              </span>
              <div className="flex items-baseline justify-center gap-1 mt-0.5">
                <span className="text-xl font-black text-amber-400">₹</span>
                <span className="text-4xl font-black tracking-tight text-white drop-shadow-[0_4px_10px_rgba(255,215,0,0.3)] tabular-nums">
                  {currentAmount.toFixed(2)}
                </span>
                <span className="text-xs font-bold text-amber-300/70">/ ₹500.00</span>
              </div>
            </div>

            {/* Progress Bar with Milestones */}
            <div className="mt-3 px-1">
              <div className="relative w-full h-4 bg-black/60 rounded-full border border-amber-500/30 overflow-hidden p-0.5 shadow-inner">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 transition-all duration-700 ease-out relative shadow-[0_0_12px_rgba(255,215,0,0.6)]"
                  style={{ width: `${progressPercent}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-1.5 text-[10px] text-amber-200/70 font-semibold px-0.5">
                <span>₹0</span>
                <span>₹100</span>
                <span>₹250</span>
                <span>₹400</span>
                <span className="text-amber-400 font-black">₹500 🎉</span>
              </div>
            </div>

            {/* Cashout Notice & Button */}
            <div className="mt-3.5 pt-3 border-t border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-2.5">
              <div className="text-center sm:text-left">
                <p className="text-[11px] text-amber-100 font-medium">
                  {currentAmount >= targetAmount ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 size={13} /> ₹500 Target reached! Cash out immediately.
                    </span>
                  ) : (
                    <span>
                      Need only <strong className="text-amber-300 font-bold">₹{(targetAmount - currentAmount).toFixed(2)}</strong> more to withdraw!
                    </span>
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCashout}
                className={`w-full sm:w-auto px-6 py-2.5 rounded-full font-black text-xs uppercase tracking-wider shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 ${
                  currentAmount >= targetAmount
                    ? 'bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.6)] border-2 border-white animate-bounce'
                    : 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-red-950 border-2 border-amber-200/80 hover:brightness-110 shadow-[0_0_15px_rgba(255,215,0,0.4)]'
                }`}
              >
                <Zap size={14} className="fill-current" />
                <span>{currentAmount >= targetAmount ? 'Instant Cash Out' : 'Cash Out ₹500'}</span>
              </button>
            </div>
          </div>

          {/* 3D Casino Spin Wheel Arena */}
          <div className="relative mt-6 flex flex-col items-center shrink-0">
            
            {/* Outer Glow Halo */}
            <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/30 via-yellow-500/40 to-red-500/30 rounded-full blur-2xl pointer-events-none animate-pulse" />

            {/* The Turntable Container */}
            <div className="relative w-80 h-80 sm:w-84 sm:h-84 flex items-center justify-center">
              
              {/* Outer Golden Chassis with Blinking LED Bulbs */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-b from-[#FFE57F] via-[#D4AF37] to-[#8C6D1F] p-3 shadow-[0_15px_35px_rgba(0,0,0,0.8),inset_0_2px_10px_rgba(255,255,255,0.6)] border-4 border-[#FFF3B0]">
                
                {/* 24 Carnival Running LED Bulbs */}
                {[...Array(24)].map((_, i) => {
                  const angle = i * (360 / 24);
                  const isEven = i % 2 === 0;
                  return (
                    <div
                      key={i}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                      style={{
                        transform: `rotate(${angle}deg) translate(0, -150px)`,
                      }}
                    >
                      <div
                        className={`w-2 h-2 rounded-full border border-white/70 shadow-md ${
                          isEven
                            ? 'bg-amber-200 animate-ping'
                            : 'bg-red-400 animate-pulse'
                        }`}
                        style={{ animationDuration: isEven ? '1.5s' : '1.8s' }}
                      />
                    </div>
                  );
                })}

                {/* Inner Dark Rim */}
                <div className="w-full h-full rounded-full bg-[#1F0202] p-1.5 shadow-[inset_0_4px_12px_rgba(0,0,0,0.8)] overflow-hidden">
                  
                  {/* Rotating Wheel Canvas/SVG */}
                  <div
                    className="w-full h-full rounded-full relative transition-transform ease-out"
                    style={{
                      transform: `rotate(${rotation}deg)`,
                      transitionDuration: isSpinning ? '4500ms' : '0ms',
                      transitionTimingFunction: 'cubic-bezier(0.12, 0.96, 0.22, 1.0)',
                    }}
                  >
                    <svg viewBox="0 0 400 400" className="w-full h-full drop-shadow-md">
                      <defs>
                        {PRIZES.map(p => (
                          <linearGradient key={p.id} id={`grad-${p.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={p.color1} />
                            <stop offset="100%" stopColor={p.color2} />
                          </linearGradient>
                        ))}
                      </defs>

                      {PRIZES.map((prize, idx) => {
                        const startAngle = idx * 45;
                        const endAngle = (idx + 1) * 45;
                        const midAngle = startAngle + 22.5;
                        
                        // SVG Arc Path Calculation
                        const rad1 = (startAngle - 90) * (Math.PI / 180);
                        const rad2 = (endAngle - 90) * (Math.PI / 180);
                        const x1 = 200 + 200 * Math.cos(rad1);
                        const y1 = 200 + 200 * Math.sin(rad1);
                        const x2 = 200 + 200 * Math.cos(rad2);
                        const y2 = 200 + 200 * Math.sin(rad2);

                        const textRad = (midAngle - 90) * (Math.PI / 180);
                        const tx = 200 + 130 * Math.cos(textRad);
                        const ty = 200 + 130 * Math.sin(textRad);
                        const iconX = 200 + 165 * Math.cos(textRad);
                        const iconY = 200 + 165 * Math.sin(textRad);

                        return (
                          <g key={prize.id}>
                            {/* Sector Wedge */}
                            <path
                              d={`M 200 200 L ${x1} ${y1} A 200 200 0 0 1 ${x2} ${y2} Z`}
                              fill={`url(#grad-${prize.id})`}
                              stroke="#FFE57F"
                              strokeWidth="2.5"
                            />
                            
                            {/* Metallic Divider Line */}
                            <line
                              x1="200"
                              y1="200"
                              x2={x2}
                              y2={y2}
                              stroke="#FFFFFF"
                              strokeWidth="1.5"
                              strokeOpacity="0.7"
                            />

                            {/* Prize Icon */}
                            <text
                              x={iconX}
                              y={iconY}
                              textAnchor="middle"
                              dominantBaseline="central"
                              fontSize="14"
                              transform={`rotate(${midAngle + 90}, ${iconX}, ${iconY})`}
                            >
                              {prize.icon}
                            </text>

                            {/* Prize Label Text */}
                            <text
                              x={tx}
                              y={ty}
                              textAnchor="middle"
                              dominantBaseline="central"
                              fill={prize.textColor}
                              fontSize={prize.isJackpot ? '20' : '17'}
                              fontWeight="900"
                              fontFamily="system-ui, sans-serif"
                              filter="drop-shadow(0px 2px 3px rgba(0,0,0,0.5))"
                              transform={`rotate(${midAngle + 90}, ${tx}, ${ty})`}
                            >
                              {prize.label}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                </div>
              </div>

              {/* 3D Top Arrow Pointer (12 o'clock) */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.7)] pointer-events-none">
                <div className="w-8 h-8 rounded-full bg-gradient-to-b from-[#FFF0A0] via-[#D4AF37] to-[#8C6D1F] border-2 border-white flex items-center justify-center shadow-inner">
                  <div className="w-3 h-3 rounded-full bg-red-600 shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)] border border-amber-200" />
                </div>
                <div className="-mt-2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[20px] border-t-gradient-to-b border-t-[#FFE066] filter drop-shadow" />
              </div>

              {/* Center 3D Spin Push Button */}
              <button
                type="button"
                onClick={handleSpin}
                disabled={isSpinning}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-gradient-to-b from-[#FFE57F] via-[#E6B800] to-[#996600] p-1.5 shadow-[0_8px_25px_rgba(0,0,0,0.7),inset_0_2px_6px_rgba(255,255,255,0.8)] border-2 border-white z-20 active:scale-95 transition-transform disabled:opacity-90 cursor-pointer group"
                aria-label="Spin Wheel"
              >
                <div className="w-full h-full rounded-full bg-gradient-to-b from-[#FF4500] via-[#D80000] to-[#800000] border-2 border-amber-300/80 flex flex-col items-center justify-center text-white shadow-inner relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-white/0 to-white/30 rounded-full pointer-events-none" />
                  
                  <span className="text-[17px] font-black tracking-tight uppercase leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
                    {isSpinning ? 'SPIN...' : 'SPIN'}
                  </span>
                  <span className="text-[8px] font-black uppercase text-amber-200 tracking-tighter mt-0.5 bg-black/40 px-1.5 py-0.5 rounded-full border border-amber-400/40">
                    {availableSpins > 0 ? `X${availableSpins} Free` : '0 Spins'}
                  </span>
                </div>
              </button>
            </div>

            {/* Quick Spin Status Badge */}
            <div className="mt-4 flex items-center gap-2">
              <div className="bg-[#1D0202] border border-amber-500/30 px-4 py-1.5 rounded-full text-xs font-extrabold text-amber-300 flex items-center gap-2 shadow-md">
                <Sparkles size={14} className="text-amber-400" />
                <span>Available Spins:</span>
                <span className="bg-amber-400 text-red-950 px-2 py-0.5 rounded-full font-black text-xs">
                  {availableSpins}
                </span>
              </div>
            </div>
          </div>

          {/* Referral Sharing Hub */}
          <div className="w-full bg-[#200202]/90 border border-amber-500/30 rounded-3xl p-4 mt-6 shadow-xl shrink-0">
            <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                  <Share2 size={16} />
                </div>
                <div>
                  <h2 className="text-xs font-black uppercase tracking-wider text-amber-200">
                    Invite Friends & Earn Spins
                  </h2>
                  <p className="text-[10px] text-amber-300/60 font-medium">
                    Every friend invited gives you +1 free spin
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowQrModal(true)}
                className="p-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 cursor-pointer transition-colors"
                title="QR Code"
              >
                <QrCode size={18} />
              </button>
            </div>

            {/* Copy Code & Link Boxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
              <div className="bg-black/50 border border-white/10 rounded-2xl p-2.5 flex items-center justify-between">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-white/50 font-bold block">Invite Code</span>
                  <span className="text-sm font-black text-amber-300 font-mono tracking-wider">{inviteCode}</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-xl text-[11px] font-bold flex items-center gap-1 border border-amber-500/30 cursor-pointer active:scale-95"
                >
                  <Copy size={12} />
                  <span>Copy</span>
                </button>
              </div>

              <div className="bg-black/50 border border-white/10 rounded-2xl p-2.5 flex items-center justify-between">
                <div className="truncate pr-2">
                  <span className="text-[9px] uppercase tracking-wider text-white/50 font-bold block">Referral Link</span>
                  <span className="text-xs font-bold text-white/90 truncate block">{inviteUrl}</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-xl text-[11px] font-bold flex items-center gap-1 border border-amber-500/30 cursor-pointer shrink-0 active:scale-95"
                >
                  <Copy size={12} />
                  <span>Copy</span>
                </button>
              </div>
            </div>

            {/* Fast Share Action Buttons */}
            <div className="grid grid-cols-2 gap-2 mt-3">
              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="w-full bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:brightness-110 text-white py-3 rounded-2xl font-black text-xs shadow-md border border-white/20 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <MessageCircle size={16} className="fill-current" />
                <span>Share WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={handleTelegramShare}
                className="w-full bg-gradient-to-r from-[#0088CC] to-[#006699] hover:brightness-110 text-white py-3 rounded-2xl font-black text-xs shadow-md border border-white/20 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Send size={16} />
                <span>Share Telegram</span>
              </button>
            </div>
          </div>

          {/* Task / Mission Center */}
          <div className="w-full bg-[#180202]/90 border border-amber-500/30 rounded-3xl p-4 mt-4 shadow-xl shrink-0">
            <div className="flex items-center gap-2 mb-3">
              <Trophy size={18} className="text-amber-400" />
              <h2 className="text-xs font-black uppercase tracking-wider text-amber-200">
                How to Get More Spins
              </h2>
            </div>

            <div className="space-y-2.5">
              {TASKS.map(task => {
                const isClaimed = claimedTasks[task.id];
                const Icon = task.icon;

                return (
                  <div
                    key={task.id}
                    className="bg-black/40 border border-white/10 rounded-2xl p-3 flex items-center justify-between gap-3 hover:border-amber-500/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-400/20 flex items-center justify-center text-amber-300 shrink-0">
                        <Icon size={18} />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-xs font-black text-white">{task.title}</h3>
                          <span className="bg-amber-500/20 text-amber-300 text-[9px] font-bold px-1.5 py-0.2 rounded border border-amber-400/30">
                            {task.reward}
                          </span>
                        </div>
                        <p className="text-[10px] text-white/60 mt-0.5">{task.desc}</p>
                      </div>
                    </div>

                    {task.claimable ? (
                      <button
                        type="button"
                        onClick={() => handleClaimTask(task.id, 1)}
                        disabled={isClaimed}
                        className={`px-3.5 py-1.5 rounded-xl font-black text-[11px] uppercase transition-all cursor-pointer shrink-0 active:scale-95 ${
                          isClaimed
                            ? 'bg-white/10 text-white/40 cursor-not-allowed'
                            : 'bg-gradient-to-r from-amber-400 to-yellow-500 text-red-950 border border-amber-200 shadow-md hover:brightness-110'
                        }`}
                      >
                        {isClaimed ? 'Claimed' : 'Claim'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className="px-3 py-1.5 rounded-xl font-bold text-[11px] bg-white/10 hover:bg-white/20 text-amber-300 border border-white/10 transition-all cursor-pointer shrink-0 flex items-center gap-1 active:scale-95"
                      >
                        <span>Go</span>
                        <ArrowRight size={12} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Live Winners & Cashout Table */}
          <div className="w-full bg-[#180202]/90 border border-amber-500/30 rounded-3xl p-4 mt-4 shadow-xl shrink-0">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-amber-500/20">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-emerald-400" />
                <h2 className="text-xs font-black uppercase tracking-wider text-amber-200">
                  Recent Platform Cashouts
                </h2>
              </div>
              <span className="text-[10px] font-bold text-amber-400/80 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                100% Real Payouts
              </span>
            </div>

            <div className="space-y-2">
              {RECENT_WINNERS.slice(0, 5).map((winner, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs py-1.5 px-2 rounded-xl bg-black/30 border border-white/5"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{winner.avatar}</span>
                    <span className="font-bold text-white/90">{winner.phone}</span>
                    <span className="text-[10px] text-white/40">{winner.time}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-amber-400/80">{winner.method}</span>
                    <span className="font-black text-emerald-400">{winner.amount}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </main>

        {/* Win Celebration Modal with Confetti */}
        {showWinModal && lastWinPrize && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[200] flex items-center justify-center p-4 animate-fadeInFast">
            <div className="bg-gradient-to-b from-[#2D0404] via-[#1A0101] to-[#0A0000] rounded-3xl p-6 border-2 border-amber-400 max-w-sm w-full text-center text-white shadow-[0_0_50px_rgba(255,215,0,0.5)] relative overflow-hidden animate-modalPop">
              
              {/* Rotating Gold Rays in Background */}
              <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,215,0,0.25)_0%,transparent_70%)] pointer-events-none" />

              <div className="w-16 h-16 rounded-full bg-gradient-to-b from-amber-300 to-yellow-600 mx-auto flex items-center justify-center text-3xl shadow-[0_0_25px_rgba(255,215,0,0.8)] border-2 border-white mb-3">
                {lastWinPrize.icon}
              </div>

              <span className="text-xs font-black uppercase tracking-widest text-amber-400 block">
                CONGRATULATIONS!
              </span>
              <h3 className="text-4xl font-black text-white mt-1 drop-shadow-md">
                +{lastWinPrize.label}
              </h3>
              <p className="text-xs text-amber-200/80 mt-1 font-medium">
                Reward added to your Invite Cashout Balance!
              </p>

              {/* Progress to 500 banner */}
              <div className="mt-4 bg-black/60 rounded-2xl p-3 border border-amber-500/30">
                <div className="flex justify-between text-[11px] font-bold text-amber-200 mb-1">
                  <span>Current Balance:</span>
                  <span className="text-white font-black">₹{currentAmount.toFixed(2)} / ₹500</span>
                </div>
                <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-[10px] text-amber-300/80 mt-1.5 font-semibold">
                  {currentAmount >= targetAmount
                    ? '🎉 You reached ₹500! Cash out right now!'
                    : `Only ₹${(targetAmount - currentAmount).toFixed(2)} left to withdraw!`}
                </p>
              </div>

              <div className="mt-5 space-y-2">
                {availableSpins > 0 ? (
                  <button
                    type="button"
                    onClick={() => {
                      setShowWinModal(false);
                      handleSpin();
                    }}
                    className="w-full py-3 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-red-950 font-black text-xs uppercase tracking-wider shadow-lg border-2 border-white cursor-pointer active:scale-95"
                  >
                    Spin Again ({availableSpins} Left)
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setShowWinModal(false);
                      handleWhatsAppShare();
                    }}
                    className="w-full py-3 rounded-full bg-gradient-to-r from-emerald-400 to-green-600 text-white font-black text-xs uppercase tracking-wider shadow-lg border-2 border-white cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <Share2 size={15} />
                    <span>Invite Friends for More Spins</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowWinModal(false)}
                  className="w-full py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white/70 font-bold text-xs uppercase transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Rules Modal */}
        {showRulesModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[160] flex items-center justify-center p-4">
            <div className="bg-[#1C0202] rounded-3xl p-6 border border-amber-500/40 max-w-sm w-full text-white shadow-2xl relative">
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-amber-500/20">
                <div className="flex items-center gap-2">
                  <HelpCircle size={18} className="text-amber-400" />
                  <h3 className="font-black text-sm uppercase text-amber-300 tracking-wider">Invite Wheel Rules</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRulesModal(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 text-xs text-gray-300 leading-relaxed max-h-80 overflow-y-auto custom-scrollbar pr-1">
                <div className="bg-black/40 rounded-2xl p-3 border border-white/5">
                  <div className="flex items-center gap-2 font-black text-amber-300 text-xs mb-1">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px]">1</span>
                    <span>Spin & Accumulate Cash</span>
                  </div>
                  <p className="text-white/70 text-[11px]">
                    Every new player gets 1 free spin upon registration. Each spin awards real cash rewards from ₹5 up to ₹500.
                  </p>
                </div>

                <div className="bg-black/40 rounded-2xl p-3 border border-white/5">
                  <div className="flex items-center gap-2 font-black text-amber-300 text-xs mb-1">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px]">2</span>
                    <span>Invite Friends for Extra Spins</span>
                  </div>
                  <p className="text-white/70 text-[11px]">
                    Share your invite code or referral link. For each valid friend that registers through your link, you get +1 extra spin.
                  </p>
                </div>

                <div className="bg-black/40 rounded-2xl p-3 border border-white/5">
                  <div className="flex items-center gap-2 font-black text-amber-300 text-xs mb-1">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px]">3</span>
                    <span>Reach ₹500 & Instant Cash Out</span>
                  </div>
                  <p className="text-white/70 text-[11px]">
                    Once your accumulated Invite Balance reaches ₹500.00, tap <strong>Cash Out</strong> to transfer the funds directly to your game wallet or bank.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowRulesModal(false)}
                className="w-full mt-4 py-3 rounded-full bg-amber-400 hover:bg-amber-300 text-red-950 font-black text-xs uppercase tracking-wider cursor-pointer"
              >
                I Understand
              </button>
            </div>
          </div>
        )}

        {/* History Modal */}
        {showHistoryModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[160] flex items-center justify-center p-4">
            <div className="bg-[#1C0202] rounded-3xl p-6 border border-amber-500/40 max-w-sm w-full text-white shadow-2xl relative flex flex-col max-h-[85vh]">
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-amber-500/20 shrink-0">
                <div className="flex items-center gap-2">
                  <FileText size={18} className="text-amber-400" />
                  <h3 className="font-black text-sm uppercase text-amber-300 tracking-wider">Activity Records</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowHistoryModal(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 p-1 bg-black/40 rounded-2xl mb-3 shrink-0 border border-white/5">
                <button
                  type="button"
                  onClick={() => setHistoryTab('spins')}
                  className={`flex-1 py-1.5 text-xs font-black rounded-xl transition-colors cursor-pointer ${
                    historyTab === 'spins' ? 'bg-amber-400 text-red-950' : 'text-white/60 hover:text-white'
                  }`}
                >
                  Spin Records
                </button>
                <button
                  type="button"
                  onClick={() => setHistoryTab('cashouts')}
                  className={`flex-1 py-1.5 text-xs font-black rounded-xl transition-colors cursor-pointer ${
                    historyTab === 'cashouts' ? 'bg-amber-400 text-red-950' : 'text-white/60 hover:text-white'
                  }`}
                >
                  Cashouts
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                {historyTab === 'spins' ? (
                  spinHistory.length === 0 ? (
                    <div className="text-center py-8 text-white/40 text-xs">
                      <Sparkles size={32} className="mx-auto mb-2 opacity-30 text-amber-400" />
                      <span>No spin records yet. Spin the wheel to win cash!</span>
                    </div>
                  ) : (
                    spinHistory.map(item => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 rounded-2xl bg-black/40 border border-white/5 text-xs"
                      >
                        <div>
                          <span className="font-bold text-white block">{item.type}</span>
                          <span className="text-[10px] text-white/40">{item.time}</span>
                        </div>
                        <span className={`font-black ${item.amount > 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {item.amount > 0 ? `+₹${item.amount.toFixed(2)}` : `₹${item.amount.toFixed(2)}`}
                        </span>
                      </div>
                    ))
                  )
                ) : (
                  <div className="text-center py-8 text-white/40 text-xs">
                    <Coins size={32} className="mx-auto mb-2 opacity-30" />
                    <span>No cashout requests yet. Accumulate ₹500 to cash out!</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* QR Code Modal */}
        {showQrModal && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[160] flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-[#1C0202] rounded-3xl p-6 border-2 border-amber-500/40 max-w-xs w-full text-center text-white shadow-2xl relative animate-modalPop">
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-400 mx-auto mb-2 flex items-center justify-center shadow-md">
                <QrCode size={22} />
              </div>
              <h3 className="font-black text-sm uppercase tracking-wider text-amber-300">Invite QR Code</h3>
              <p className="text-[11px] text-white/60 mt-1">Friends can scan this QR code with any scanner to join!</p>

              <div className="my-4">
                <QRCodeView
                  value={inviteUrl}
                  size={190}
                  logoText="BW"
                  showDownload={true}
                />
              </div>

              <div className="bg-black/60 rounded-xl p-2.5 text-xs font-mono text-amber-300 font-bold mb-3 border border-amber-500/20 flex items-center justify-between">
                <span className="text-[10px] text-white/40 uppercase font-sans">Code:</span>
                <span className="tracking-wider">{inviteCode}</span>
              </div>

              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full py-3 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-red-950 font-black text-xs uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer border border-white/60"
              >
                Copy Invite Link
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default InviteWheel;
