import React, { useState } from 'react';
import { Volume2, X, Bell, ShieldCheck, Sparkles } from 'lucide-react';
import { navigateTo } from '../../lib/navigation';
import { useAudio } from '../../context/AudioContext';

const Announcement = () => {
  const { playChip } = useAudio();
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div
        onClick={() => {
          playChip();
          setShowModal(true);
        }}
        className="flex items-center gap-2 bg-[#121b38] px-3.5 py-2.5 rounded-2xl mb-4 mx-4 cursor-pointer hover:bg-[#182348] transition-colors border border-casino-gold/20 shadow-md select-none"
        role="button"
        tabIndex={0}
      >
        <div className="w-7 h-7 rounded-xl bg-casino-gold/15 text-casino-gold flex items-center justify-center shrink-0">
          <Volume2 size={15} />
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="whitespace-nowrap animate-scroll text-xs text-white/90 font-medium">
            🔥 Welcome to Breeww! India's #1 Premier Live Casino & Crash Arena · Instant 24/7 UPI Fast Deposits & Automated Withdrawals · Play Aviator, WinGo, Mines, Dragon Tiger & Win Real Cash!
          </div>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            playChip();
            setShowModal(true);
          }}
          className="bg-gradient-to-r from-casino-gold to-orange-500 hover:brightness-110 active:scale-95 text-slate-950 text-[10px] font-black uppercase px-2.5 py-1 rounded-xl flex items-center gap-1 shrink-0 transition-all cursor-pointer shadow-sm"
        >
          <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-ping" />
          Detail
        </button>
      </div>

      {/* Announcement Detail Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="game-glass rounded-3xl p-6 border border-casino-gold/40 bg-[#0d1424] max-w-sm w-full text-white shadow-2xl animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-casino-gold/20 text-casino-gold flex items-center justify-center">
                  <Bell size={18} />
                </div>
                <h3 className="font-black text-sm uppercase tracking-wider text-casino-gold">
                  Official Announcement
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-white/40 hover:text-white cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 text-xs text-white/80 leading-relaxed bg-black/40 p-4 rounded-2xl border border-white/5">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs mb-1">
                <Sparkles size={14} /> Breeww Daily High Roller Events
              </div>
              <p>
                Welcome to <strong>Breeww</strong>! We offer provably fair crash games, lottery number predictions, and instant live cards with the highest RTPs in the industry.
              </p>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-white/60">
                <li>Instant UPI & IMPS Bank deposits with +3% extra coin bonus.</li>
                <li>Fast automated cashout approvals under 5 minutes.</li>
                <li>VIP Attendance streaks: Claim up to ₹1,000 every week!</li>
                <li>Invite friends and earn 3-Tier lifetime team commissions.</li>
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4">
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  navigateTo('/activity');
                }}
                className="py-2.5 rounded-xl bg-casino-gold text-slate-950 font-black text-xs uppercase tracking-wider shadow-md hover:brightness-110 cursor-pointer"
              >
                View Events
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  navigateTo('/wallet');
                }}
                className="py-2.5 rounded-xl bg-emerald-600 text-white font-black text-xs uppercase tracking-wider shadow-md hover:bg-emerald-500 cursor-pointer"
              >
                Recharge
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Announcement;
