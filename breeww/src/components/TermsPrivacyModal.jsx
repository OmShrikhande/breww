import React, { useState } from 'react';
import {
  Shield,
  FileText,
  Lock,
  Scale,
  AlertTriangle,
  CheckCircle,
  X,
  CreditCard,
  Gamepad2,
  Award,
} from 'lucide-react';

const TermsPrivacyModal = ({ isOpen, onClose, onAccept }) => {
  const [activeTab, setActiveTab] = useState('terms'); // 'terms' | 'privacy'

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[140] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div
        className="w-full max-w-2xl max-h-[90vh] bg-[#1C0202] border-2 border-amber-500/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-modalPop text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#3D0505] via-[#2A0404] to-[#1C0202] border-b border-amber-500/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-400/40 flex items-center justify-center font-black">
              <Scale size={18} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                <span className="text-amber-400">Breeww</span> Legal & Compliance
              </h2>
              <p className="text-[11px] text-amber-200/60 font-medium">
                Official User Agreement & Data Protection Protocol
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-black/40 border-b border-amber-500/20 px-6 pt-3 gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('terms')}
            className={`pb-3 px-4 font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'terms'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-white/50 hover:text-white/80'
            }`}
          >
            <FileText size={15} /> Terms of Service
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className={`pb-3 px-4 font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'privacy'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-white/50 hover:text-white/80'
            }`}
          >
            <Shield size={15} /> Privacy Policy
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-xs text-white/80 leading-relaxed font-normal custom-scrollbar">
          {activeTab === 'terms' ? (
            <>
              {/* Top Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <div className="p-3 rounded-2xl bg-black/40 border border-amber-500/20 flex items-center gap-2">
                  <span className="text-base font-black text-amber-400">18+</span>
                  <span className="text-[11px] font-bold text-white/70">Strictly 18+ Only</span>
                </div>
                <div className="p-3 rounded-2xl bg-black/40 border border-amber-500/20 flex items-center gap-2">
                  <Award size={16} className="text-amber-400" />
                  <span className="text-[11px] font-bold text-white/70">Provably Fair SHA-256</span>
                </div>
                <div className="p-3 rounded-2xl bg-black/40 border border-amber-500/20 col-span-2 sm:col-span-1 flex items-center gap-2">
                  <Lock size={16} className="text-emerald-400" />
                  <span className="text-[11px] font-bold text-white/70">Instant UPI Settlements</span>
                </div>
              </div>

              {/* Section 1: Eligibility */}
              <section className="space-y-2">
                <h3 className="text-sm font-black text-amber-300 flex items-center gap-1.5">
                  1. Age Restriction & Eligibility
                </h3>
                <p>
                  Access to the Breeww gaming platform is strictly prohibited to individuals under 18 years of age. By registering an account, you affirm under penalty of perjury that you are of legal age in your jurisdiction and have the full legal capacity to enter into binding entertainment agreements.
                </p>
              </section>

              {/* Section 2: Account Security & One Person One Account */}
              <section className="space-y-2">
                <h3 className="text-sm font-black text-amber-300 flex items-center gap-1.5">
                  2. Single Account & Integrity Policy
                </h3>
                <p>
                  Each player is permitted exactly <strong>one registered account</strong> verified via a genuine mobile number. Creating duplicate, fraudulent, or multi-bot accounts to exploit bonuses, referral programs, or arbitrage is strictly prohibited and constitutes grounds for immediate forfeiture of balances and platform banning.
                </p>
              </section>

              {/* Section 3: Provably Fair Gaming & Crash Engines */}
              <section className="space-y-2">
                <h3 className="text-sm font-black text-amber-300 flex items-center gap-1.5">
                  <Gamepad2 size={16} /> 3. Provably Fair Algorithm & Crash Multipliers
                </h3>
                <p>
                  All games hosted on Breeww (including Aviator, WinGo Colour Prediction, Mines, Dragon Tiger, and Dice) operate on an immutable, provably fair cryptographic system:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-white/70 text-[11px]">
                  <li>
                    <strong>Aviator Crash Point:</strong> Computed using high-entropy SHA-256 server seed hashing merged with client parameters before each flight begins. No third party or operator can manipulate flight duration during an active round.
                  </li>
                  <li>
                    <strong>WinGo & Card Games:</strong> Round settlement occurs deterministically every scheduled second interval with automated RNG verification.
                  </li>
                </ul>
              </section>

              {/* Section 4: Deposits & UPI UTR Verification */}
              <section className="space-y-2">
                <h3 className="text-sm font-black text-amber-300 flex items-center gap-1.5">
                  <CreditCard size={16} /> 4. Deposits, UPI QR & 12-Digit UTR Protocol
                </h3>
                <p>
                  Deposits are processed through official UPI QR Pay & Fast-Pay routes. Upon completing payment through your banking app (PhonePe, Google Pay, Paytm, BHIM, or NetBanking), you must submit the exact <strong>12-digit UPI Transaction Reference (UTR) number</strong>. Fraudulent or duplicate UTR submissions are automatically flagged by anti-fraud scanners.
                </p>
              </section>

              {/* Section 5: Withdrawals & Fair Play Compliance */}
              <section className="space-y-2">
                <h3 className="text-sm font-black text-amber-300 flex items-center gap-1.5">
                  5. Withdrawals & Payout Settlements
                </h3>
                <p>
                  Withdrawal requests are processed securely to the player's designated bank account / UPI ID. Players must fulfill standard game turnover requirements on deposited funds to maintain compliance with anti-money laundering (AML) standards before initiating cashouts.
                </p>
              </section>

              {/* Section 6: Responsible Gaming */}
              <section className="space-y-2 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                <h3 className="text-xs font-black text-amber-400 flex items-center gap-1.5">
                  <AlertTriangle size={15} /> 6. Responsible Gaming Notice
                </h3>
                <p className="text-[11px] text-amber-200/80">
                  Online skill and chance gaming involves financial risk. We encourage all players to set personal budget limits, avoid chasing losses, and practice responsible entertainment habits.
                </p>
              </section>
            </>
          ) : (
            <>
              {/* Privacy Policy */}
              <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-3">
                <Shield size={22} className="text-emerald-400 shrink-0" />
                <p className="text-[11px] text-emerald-200/90 font-medium">
                  Breeww utilizes 256-bit SSL encryption to guarantee zero unauthorized access to your private credentials, gameplay history, and wallet ledgers.
                </p>
              </div>

              {/* Section 1: Data Collection */}
              <section className="space-y-2">
                <h3 className="text-sm font-black text-amber-300">
                  1. Information We Collect
                </h3>
                <p>
                  We collect strictly necessary data required to create, verify, and secure your gaming profile:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-white/70 text-[11px]">
                  <li>Registered 10-digit mobile phone number and cryptographic password hash.</li>
                  <li>Transaction ledger history (deposit amount, 12-digit UTR, withdrawal destination).</li>
                  <li>Real-time gameplay records, multipliers, and round receipts.</li>
                  <li>Device authentication tokens for secure single-session sign-on.</li>
                </ul>
              </section>

              {/* Section 2: Data Usage */}
              <section className="space-y-2">
                <h3 className="text-sm font-black text-amber-300">
                  2. How We Use Your Information
                </h3>
                <p>
                  Collected data is exclusively utilized to:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-white/70 text-[11px]">
                  <li>Verify account authenticity and prevent multi-account identity fraud.</li>
                  <li>Credit instant deposits upon UTR confirmation and process withdrawal payouts.</li>
                  <li>Calculate referral bonuses, promotional tier upgrades, and VIP perks.</li>
                  <li>Deliver 24/7 technical assistance and dispute resolution.</li>
                </ul>
              </section>

              {/* Section 3: Non-Disclosure */}
              <section className="space-y-2">
                <h3 className="text-sm font-black text-amber-300">
                  3. Non-Disclosure & Zero Third-Party Selling
                </h3>
                <p>
                  Breeww does <strong>never sell, rent, or lease</strong> personal player data to external marketing vendors, advertisers, or unaffiliated third parties. All server communications are encrypted using high-grade Transport Layer Security (TLS 1.3).
                </p>
              </section>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-black/50 border-t border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <span className="text-[11px] text-white/50 font-medium text-center sm:text-left">
            By clicking Accept, you agree to all terms and conditions above.
          </span>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                if (onAccept) onAccept();
                onClose();
              }}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-red-950 font-black text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-white/60"
            >
              <CheckCircle size={15} /> I Understand & Agree
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPrivacyModal;
