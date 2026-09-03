import React, { useState, useEffect } from 'react';
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Smartphone,
  UserRoundPlus,
  Gift,
  CheckCircle2,
  Headphones,
  ShieldCheck,
  Crown,
} from 'lucide-react';
import { navigateTo } from '../lib/navigation';
import { useAuth } from '../context/AuthContext';
import { useAudio } from '../context/AudioContext';
import TermsPrivacyModal from '../components/TermsPrivacyModal';

const Register = () => {
  const { register } = useAuth();
  const { playWin, playChip } = useAudio();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [agreed, setAgreed] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code') || params.get('r') || params.get('invite');
      if (code) setInviteCode(code);
    } catch {
      // ignore
    }
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handlePhoneChange = (e) => {
    setError('');
    const cleanDigits = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(cleanDigits);
  };

  const onSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');

    const raw = phone.trim();
    if (!raw) {
      setError('Please enter your 10-digit mobile number');
      return;
    }

    if (raw.length !== 10) {
      setError('Mobile number must be exactly 10 digits');
      return;
    }

    if (!/^[6-9]\d{9}$/.test(raw)) {
      setError('Please enter a valid Indian mobile number starting with 6, 7, 8, or 9');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password.length > 32) {
      setError('Password cannot exceed 32 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    if (!agreed) {
      setError('Please accept the Privacy Policy and User Agreement');
      return;
    }

    setBusy(true);
    try {
      playChip();
      await register({
        method: 'phone',
        identifier: raw,
        password,
        inviteCode: inviteCode.trim() || undefined,
      });
      playWin();
      showToast('🎉 Account registered successfully! Welcome to Breeww!');
      setTimeout(() => navigateTo('/'), 800);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b19] flex justify-center text-white select-none px-3 py-6">
      {toastMessage && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 bg-[#1C0202] border-2 border-amber-400 text-amber-200 px-5 py-2.5 rounded-full text-xs font-black shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 size={16} className="text-amber-400" /> {toastMessage}
        </div>
      )}

      <div className="w-full max-w-md rounded-3xl bg-gradient-to-b from-[#8B0000] via-[#450505] to-[#180202] border-2 border-amber-500/40 shadow-2xl overflow-hidden flex flex-col justify-between">
        {/* Header Ribbon (Tiranga / Big Mumbai / 1Win Style) */}
        <div className="px-6 pt-6 pb-5 bg-black/40 border-b border-amber-500/30 relative">
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => navigateTo('/')}
              className="flex items-center gap-2 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center text-red-950 font-black shadow-md border border-white/60">
                <Crown size={18} className="fill-current" />
              </div>
              <span className="text-2xl font-black italic tracking-tighter gold-text-gradient drop-shadow">
                Breeww
              </span>
            </button>

            <a
              href="https://t.me/"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-300 hover:text-white transition-all flex items-center gap-1 text-[11px] font-bold"
            >
              <Headphones size={14} /> 24/7 Support
            </a>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">Register Account</h1>
          <p className="text-xs text-amber-200/70 mt-1">Register using your mobile number to claim bonus</p>
        </div>

        {/* Register Form */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-2xl bg-red-950/60 border border-red-500/40 text-red-400 text-xs font-bold animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            {/* Phone Number Field */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-amber-300/80 mb-1.5 flex items-center gap-1.5">
                <Smartphone size={14} className="text-amber-400" /> Mobile Phone Number
              </label>
              <div className="flex gap-2">
                <div className="h-12 px-3.5 rounded-2xl bg-black/60 border border-amber-500/30 flex items-center justify-center font-black text-sm text-amber-400 shrink-0">
                  +91
                </div>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  required
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="Enter 10-digit mobile number"
                  className="flex-1 h-12 px-4 rounded-2xl bg-black/60 border border-amber-500/30 text-white font-bold text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all tabular-nums"
                />
              </div>
            </div>

            {/* Set Password */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-amber-300/80 mb-1.5 flex items-center gap-1.5">
                <LockKeyhole size={14} className="text-amber-400" /> Set Login Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setError('');
                    setPassword(e.target.value);
                  }}
                  placeholder="Set password (6–32 characters)"
                  className="w-full h-12 px-4 pr-11 rounded-2xl bg-black/60 border border-amber-500/30 text-white font-bold text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-amber-300/80 mb-1.5 flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-amber-400" /> Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => {
                    setError('');
                    setConfirmPassword(e.target.value);
                  }}
                  placeholder="Re-enter password"
                  className="w-full h-12 px-4 pr-11 rounded-2xl bg-black/60 border border-amber-500/30 text-white font-bold text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Invitation Code */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-amber-300/80 mb-1.5 flex items-center gap-1.5">
                <Gift size={14} className="text-amber-400" /> Invitation Code (Optional)
              </label>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="Enter referral / invitation code"
                className="w-full h-12 px-4 rounded-2xl bg-black/60 border border-amber-500/30 text-amber-300 font-mono font-bold text-sm uppercase focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
              />
            </div>

            {/* Agreement Checkbox */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="agreement"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="w-4 h-4 rounded bg-black/50 border-amber-500/30 text-amber-400 focus:ring-amber-400 cursor-pointer"
              />
              <label htmlFor="agreement" className="text-xs text-amber-100/70 cursor-pointer">
                I have read and agree to the{' '}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowTermsModal(true);
                  }}
                  className="text-amber-400 underline font-bold hover:text-amber-300 transition-colors cursor-pointer inline"
                >
                  Privacy Policy & Service Terms
                </button>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={busy}
              className="w-full h-13 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-red-950 font-black text-sm uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 border-2 border-white/80"
            >
              {busy ? (
                <div className="w-5 h-5 border-2 border-red-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <UserRoundPlus size={18} /> Register Now
                </>
              )}
            </button>
          </form>

          {/* Already have an account link */}
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => navigateTo('/login')}
              className="text-xs font-bold text-white/70 hover:text-white transition-colors cursor-pointer"
            >
              Already have an account?{' '}
              <span className="text-amber-400 font-black underline">Log In</span>
            </button>
          </div>
        </div>

        {/* Security Footer Note */}
        <div className="p-4 bg-black/50 border-t border-amber-500/20 text-center text-[10px] text-white/50 font-medium">
          🔒 256-Bit SSL Encrypted · Provably Fair Gaming Engine
        </div>
      </div>

      {/* Terms of Service & Privacy Policy Modal */}
      <TermsPrivacyModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAccept={() => setAgreed(true)}
      />
    </div>
  );
};

export default Register;
