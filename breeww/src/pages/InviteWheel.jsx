import React, { useState } from 'react';
import { ChevronLeft, HelpCircle, FileText, CheckCircle2, Copy, X, Share2 } from 'lucide-react';
import { goBackOr, navigateTo } from '../lib/navigation';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../hooks/useWallet';

const PRIZES = [
  { value: 500, label: '₹500', angle: 0 },
  { value: 80, label: '₹80', angle: 45 },
  { value: 20, label: '₹20', angle: 90 },
  { value: 30, label: '₹30', angle: 135 },
  { value: 50, label: '₹50', angle: 180 },
  { value: 10, label: '₹10', angle: 225 },
  { value: 5, label: '₹5', angle: 270 },
  { value: 15, label: '₹15', angle: 315 },
];

const InviteWheel = () => {
  const { user, isAuthenticated } = useAuth();
  const { refreshBalance } = useWallet();

  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [currentAmount, setCurrentAmount] = useState(475.60);
  const [toastMessage, setToastMessage] = useState('');
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const inviteCode = user?.inviteCode || 'BW9928';
  const inviteUrl = `${window.location.origin}/register?invite=${inviteCode}`;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(inviteUrl).then(() => {
      showToast('📋 Referral link copied! Share with friends to get extra spins.');
    });
  };

  const handleCashout = () => {
    if (!isAuthenticated) {
      navigateTo('/login');
      return;
    }
    if (currentAmount < 500) {
      showToast(`⚠️ Minimum cashout is ₹500.00. You need ₹${(500 - currentAmount).toFixed(2)} more!`);
      return;
    }
    showToast(`🎉 ₹${currentAmount.toFixed(2)} credited to your wallet!`);
    setCurrentAmount(0);
    refreshBalance();
  };

  const handleSpin = () => {
    if (isSpinning) return;
    if (!isAuthenticated) {
      navigateTo('/login');
      return;
    }

    setIsSpinning(true);
    const winIndex = Math.floor(Math.random() * PRIZES.length);
    const prize = PRIZES[winIndex];
    const newRotation = rotation + 1800 + (360 - prize.angle);
    setRotation(newRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setCurrentAmount((prev) => Number((prev + prize.value).toFixed(2)));
      showToast(`🎉 You won ${prize.label}! Added to your invite balance.`);
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-[#8c919e] flex justify-center select-none">
      <div className="w-full max-w-md bg-gradient-to-b from-[#FF5C38] via-[#FF3B30] to-[#E60000] text-white relative shadow-2xl border-x border-white/5 flex flex-col min-h-screen">
        {/* Header */}
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md h-12 bg-[#2D4594] flex items-center justify-between px-4 z-[110] shadow-md">
          <button type="button" onClick={() => goBackOr('/')} className="p-1 hover:bg-white/10 rounded cursor-pointer">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-bold uppercase tracking-tight">Invite Wheel</h1>
          <div className="flex gap-3">
            <button type="button" onClick={() => setShowRulesModal(true)} className="p-1 hover:text-amber-300 transition-colors cursor-pointer" title="Rules">
              <HelpCircle size={20} />
            </button>
            <button type="button" onClick={() => setShowHistoryModal(true)} className="p-1 hover:text-amber-300 transition-colors cursor-pointer" title="History">
              <FileText size={20} />
            </button>
          </div>
        </div>

        {/* Toast */}
        {toastMessage && (
          <div className="fixed top-14 left-1/2 -translate-x-1/2 z-[120] bg-black/90 border border-amber-400 text-amber-300 px-5 py-2.5 rounded-full text-xs font-bold shadow-2xl animate-fadeIn max-w-[90%] text-center">
            {toastMessage}
          </div>
        )}

        <main className="flex-1 pt-14 overflow-y-auto custom-scrollbar flex flex-col items-center pb-8">
          {/* Amount Info */}
          <div className="mt-4 flex flex-col items-center shrink-0">
            <span className="text-[10px] opacity-80 uppercase tracking-wider font-bold">My Invite Balance (71:57:05)</span>
            <h2 className="text-4xl font-black mt-1 tabular-nums">₹{currentAmount.toFixed(2)}</h2>

            <button
              type="button"
              onClick={handleCashout}
              className="mt-3 bg-[#FFC526] hover:bg-[#ffd255] active:scale-95 text-[#E60000] px-10 py-2 rounded-full font-black text-sm shadow-lg border-2 border-white/40 uppercase transition-all cursor-pointer"
            >
              Cash Out
            </button>
          </div>

          {/* Wheel Section */}
          <div className="relative mt-8 w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center shrink-0">
            <div className="absolute inset-0 bg-[#FFD700]/25 blur-[60px] rounded-full" />

            {/* The Wheel */}
            <div
              className="relative w-full h-full rounded-full border-[10px] border-[#FFD700] shadow-[0_0_30px_rgba(255,215,0,0.4)] overflow-hidden transition-transform duration-[4000ms] ease-out bg-white"
              style={{ transform: `rotate(${rotation}deg)` }}
            >
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute top-0 left-1/2 w-[2px] h-1/2 bg-[#FFD700] origin-bottom"
                  style={{ transform: `rotate(${i * 45}deg) translateX(-50%)` }}
                />
              ))}

              {/* Prizes */}
              <div className="absolute top-[15%] left-1/2 -translate-x-1/2 text-[#E60000] font-black text-xs">₹500</div>
              <div className="absolute top-[25%] right-[15%] text-[#E60000] font-black text-xs rotate-[45deg]">₹80</div>
              <div className="absolute top-[50%] right-[5%] -translate-y-1/2 text-[#E60000] font-black text-xs rotate-[90deg]">₹20</div>
              <div className="absolute bottom-[25%] right-[15%] text-[#E60000] font-black text-xs rotate-[135deg]">₹30</div>
              <div className="absolute bottom-[15%] left-1/2 -translate-x-1/2 text-[#E60000] font-black text-xs rotate-[180deg]">₹50</div>
              <div className="absolute bottom-[25%] left-[15%] text-[#E60000] font-black text-xs rotate-[225deg]">₹10</div>
              <div className="absolute top-[50%] left-[5%] -translate-y-1/2 text-[#E60000] font-black text-xs rotate-[270deg]">₹5</div>
              <div className="absolute top-[25%] left-[15%] text-[#E60000] font-black text-xs rotate-[315deg]">₹15</div>
            </div>

            {/* Center Spin Button */}
            <button
              type="button"
              onClick={handleSpin}
              disabled={isSpinning}
              className="absolute inset-0 m-auto w-20 h-20 bg-gradient-to-b from-[#FF5C38] to-[#E60000] rounded-full border-4 border-[#FFD700] shadow-2xl flex flex-col items-center justify-center z-10 active:scale-95 transition-transform disabled:opacity-80 cursor-pointer text-white"
            >
              <span className="text-xl font-black italic">X1</span>
              <span className="text-[8px] font-bold uppercase tracking-tighter">{isSpinning ? 'Spinning' : 'Free Spin'}</span>
            </button>
          </div>

          {/* Footer Actions */}
          <div className="mt-12 flex flex-col items-center w-full px-6 pb-6 shrink-0">
            <button
              type="button"
              onClick={handleCopyLink}
              className="w-full bg-gradient-to-b from-[#FFD700] to-[#FF8C00] hover:from-[#ffe033] hover:to-[#ffa01a] text-[#E60000] py-3.5 rounded-full font-black text-sm shadow-[0_4px_15px_rgba(0,0,0,0.3)] uppercase border-2 border-white/50 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
            >
              <Share2 size={16} />
              Invite Friends to Get Spin
            </button>
          </div>
        </main>

        {/* Rules Modal */}
        {showRulesModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[130] flex items-center justify-center p-4">
            <div className="bg-[#1B233D] rounded-3xl p-6 border border-white/10 max-w-sm w-full text-white shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-black text-base uppercase text-casino-gold">Invite Wheel Rules</h3>
                <button type="button" onClick={() => setShowRulesModal(false)} className="p-1 hover:text-red-400">
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-3 text-xs text-gray-300 leading-relaxed">
                <p>1. Every friend you invite gives you 1 extra spin on the Invite Wheel.</p>
                <p>2. Win up to ₹500 per spin. All rewards accumulate in your Invite Balance.</p>
                <p>3. Once your balance reaches ₹500.00, tap <strong>Cash Out</strong> to transfer directly to your wallet.</p>
              </div>
            </div>
          </div>
        )}

        {/* History Modal */}
        {showHistoryModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[130] flex items-center justify-center p-4">
            <div className="bg-[#1B233D] rounded-3xl p-6 border border-white/10 max-w-sm w-full text-white shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-black text-base uppercase text-casino-gold">Spin History</h3>
                <button type="button" onClick={() => setShowHistoryModal(false)} className="p-1 hover:text-red-400">
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-2 text-xs text-gray-300">
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span>Free Registration Spin</span>
                  <span className="font-bold text-emerald-400">+₹475.60</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InviteWheel;
