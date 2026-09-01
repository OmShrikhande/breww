import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Smartphone,
  Mail,
  LogIn,
  CheckCircle2,
  Headphones,
  KeyRound,
  X,
  Send,
  UserRoundPlus,
} from 'lucide-react';
import { navigateTo } from '../lib/navigation';
import { useAuth } from '../context/AuthContext';
import { useAudio } from '../context/AudioContext';

const Login = () => {
  const { login, forgotPassword } = useAuth();
  const { playWin, playChip } = useAudio();

  const [method, setMethod] = useState('phone');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotPhone, setForgotPhone] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPass, setForgotNewPass] = useState('');
  const [forgotConfirmPass, setForgotConfirmPass] = useState('');
  const [forgotBusy, setForgotBusy] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [otpCooldown, setOtpCooldown] = useState(0);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleIdentifierChange = (e) => {
    setError('');
    if (method === 'phone') {
      const cleanDigits = e.target.value.replace(/\D/g, '').slice(0, 10);
      setIdentifier(cleanDigits);
    } else {
      setIdentifier(e.target.value.slice(0, 100));
    }
  };

  const onSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');

    const raw = identifier.trim();
    if (!raw) {
      setError(method === 'phone' ? 'Please enter your 10-digit mobile number' : 'Please enter your email address');
      return;
    }

    if (method === 'phone') {
      if (raw.length !== 10) {
        setError('Mobile number must be exactly 10 digits');
        return;
      }
      if (!/^[6-9]\d{9}$/.test(raw)) {
        setError('Please enter a valid Indian mobile number starting with 6, 7, 8, or 9');
        return;
      }
    }

    if (!password) {
      setError('Please enter your login password');
      return;
    }

    setBusy(true);
    try {
      playChip();
      await login({ method, identifier: raw, password });
      playWin();
      showToast('🎉 Login Successful! Welcome back!');
      setTimeout(() => navigateTo('/'), 600);
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please check your mobile number and password.');
    } finally {
      setBusy(false);
    }
  };

  const handleSendOtp = () => {
    const raw = forgotPhone.trim();
    if (raw.length !== 10 || !/^[6-9]\d{9}$/.test(raw)) {
      setForgotError('Please enter a valid 10-digit mobile number first');
      return;
    }
    setForgotError('');
    playChip();
    setForgotOtp('123456');
    setOtpCooldown(60);
    showToast('📩 Verification code sent! (OTP: 123456)');

    const timer = setInterval(() => {
      setOtpCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setForgotError('');

    const rawPhone = forgotPhone.trim();
    if (rawPhone.length !== 10) {
      setForgotError('Please enter a valid 10-digit mobile number');
      return;
    }

    if (forgotNewPass.length < 6) {
      setForgotError('New password must be at least 6 characters');
      return;
    }

    if (forgotNewPass !== forgotConfirmPass) {
      setForgotError('Passwords do not match. Please re-enter.');
      return;
    }

    setForgotBusy(true);
    try {
      playChip();
      await forgotPassword({
        phone: rawPhone,
        newPassword: forgotNewPass,
        otp: forgotOtp,
      });
      playWin();
      showToast('🎉 Password reset successfully! Please log in.');
      setShowForgotModal(false);
      setForgotPhone('');
      setForgotOtp('');
      setForgotNewPass('');
      setForgotConfirmPass('');
      setIdentifier(rawPhone);
    } catch (err) {
      setForgotError(err.message || 'Failed to reset password. Please check your mobile number.');
    } finally {
      setForgotBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f24] flex justify-center text-white select-none px-3 py-6">
      {toastMessage && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-white px-5 py-2.5 rounded-full text-xs font-black shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 size={16} /> {toastMessage}
        </div>
      )}

      <div className="w-full max-w-md rounded-3xl bg-[#131b38] border border-white/10 shadow-2xl overflow-hidden flex flex-col justify-between">
        {/* Header Ribbon (Tiranga / Big Mumbai / 1Win Style) */}
        <div className="px-6 pt-6 pb-5 bg-gradient-to-b from-[#1c2752] to-[#131b38] border-b border-white/10 relative">
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => navigateTo('/')}
              className="text-2xl font-black italic tracking-tighter text-white flex items-center gap-1 cursor-pointer"
            >
              <span className="text-casino-gold">B</span>reeww
            </button>

            <a
              href="https://t.me/"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 hover:text-white transition-all flex items-center gap-1 text-[11px] font-bold"
            >
              <Headphones size={14} /> 24/7 Support
            </a>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">Player Login</h1>
          <p className="text-xs text-white/60 mt-1">Log in with your phone or email to play and win</p>
        </div>

        {/* Method Toggle Tab */}
        <div className="p-6 space-y-4">
          <div className="flex bg-black/40 p-1 rounded-2xl border border-white/10 gap-1">
            <button
              type="button"
              onClick={() => {
                playChip();
                setMethod('phone');
                setIdentifier('');
                setError('');
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                method === 'phone'
                  ? 'bg-gradient-to-r from-casino-gold to-orange-500 text-slate-950 shadow-md'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              <Smartphone size={14} /> Phone Login
            </button>
            <button
              type="button"
              onClick={() => {
                playChip();
                setMethod('email');
                setIdentifier('');
                setError('');
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                method === 'email'
                  ? 'bg-gradient-to-r from-casino-gold to-orange-500 text-slate-950 shadow-md'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              <Mail size={14} /> Email Login
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-bold animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            {/* Identifier input */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-white/60 mb-1.5">
                {method === 'phone' ? 'Phone Number' : 'Email Address'}
              </label>
              <div className="flex gap-2">
                {method === 'phone' && (
                  <div className="h-12 px-3.5 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center font-black text-sm text-casino-gold shrink-0">
                    +91
                  </div>
                )}
                <input
                  type={method === 'phone' ? 'tel' : 'email'}
                  inputMode={method === 'phone' ? 'numeric' : 'email'}
                  maxLength={method === 'phone' ? 10 : 100}
                  required
                  value={identifier}
                  onChange={handleIdentifierChange}
                  placeholder={method === 'phone' ? 'Enter 10-digit phone' : 'Enter email address'}
                  className="flex-1 h-12 px-4 rounded-2xl bg-black/40 border border-white/10 text-white font-bold text-sm focus:outline-none focus:border-casino-gold focus:ring-1 focus:ring-casino-gold transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-white/60 mb-1.5 flex items-center justify-between">
                <span>Login Password</span>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-casino-gold hover:underline lowercase text-[11px] font-bold cursor-pointer"
                >
                  Forgot password?
                </button>
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
                  placeholder="Enter login password"
                  className="w-full h-12 px-4 pr-11 rounded-2xl bg-black/40 border border-white/10 text-white font-bold text-sm focus:outline-none focus:border-casino-gold focus:ring-1 focus:ring-casino-gold transition-all"
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

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs text-white/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-black/40 border-white/20 text-casino-gold focus:ring-casino-gold cursor-pointer"
                />
                Remember me
              </label>
            </div>

            {/* Login Submit Button */}
            <button
              type="submit"
              disabled={busy}
              className="w-full h-13 py-3 rounded-2xl bg-gradient-to-r from-casino-gold via-amber-400 to-orange-500 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {busy ? (
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={18} /> Log In
                </>
              )}
            </button>
          </form>

          {/* Register Prompt */}
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => navigateTo('/register')}
              className="text-xs font-bold text-white/60 hover:text-white transition-colors cursor-pointer"
            >
              Don't have an account?{' '}
              <span className="text-casino-gold font-black underline">Register Now</span>
            </button>
          </div>
        </div>

        {/* Security Footer Note */}
        <div className="p-4 bg-black/40 border-t border-white/5 text-center text-[10px] text-white/40 font-medium">
          🔒 256-Bit SSL Encrypted · Provably Fair Gaming Engine
        </div>
      </div>

      {/* FORGOT PASSWORD MODAL */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-[#131b38] border border-casino-gold/40 p-6 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-casino-gold/20 text-casino-gold flex items-center justify-center">
                  <KeyRound size={18} />
                </div>
                <h3 className="font-black text-white text-base">Reset Password</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="text-white/40 hover:text-white cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {forgotError && (
              <div className="p-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-bold mb-3">
                {forgotError}
              </div>
            )}

            <form onSubmit={handleResetPasswordSubmit} className="space-y-3">
              {/* Phone */}
              <div>
                <label className="text-[10px] font-bold uppercase text-white/50 block mb-1">
                  Registered Mobile Number
                </label>
                <div className="flex gap-2">
                  <div className="h-10 px-3 rounded-xl bg-black/50 border border-white/10 flex items-center text-xs font-black text-casino-gold">
                    +91
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    required
                    value={forgotPhone}
                    onChange={(e) => setForgotPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="10-digit mobile"
                    className="flex-1 h-10 px-3 rounded-xl bg-black/50 border border-white/10 text-white text-xs font-bold focus:outline-none focus:border-casino-gold"
                  />
                </div>
              </div>

              {/* OTP */}
              <div>
                <label className="text-[10px] font-bold uppercase text-white/50 block mb-1">
                  SMS Verification Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value)}
                    placeholder="Enter code"
                    className="flex-1 h-10 px-3 rounded-xl bg-black/50 border border-white/10 text-white text-xs font-mono font-bold focus:outline-none focus:border-casino-gold"
                  />
                  <button
                    type="button"
                    disabled={otpCooldown > 0}
                    onClick={handleSendOtp}
                    className={`px-3 h-10 rounded-xl text-[10px] font-black uppercase tracking-wider shrink-0 cursor-pointer ${
                      otpCooldown > 0
                        ? 'bg-white/10 text-white/40 cursor-not-allowed'
                        : 'bg-casino-gold text-slate-950 hover:brightness-110'
                    }`}
                  >
                    {otpCooldown > 0 ? `${otpCooldown}s` : 'Send OTP'}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="text-[10px] font-bold uppercase text-white/50 block mb-1">
                  Set New Password
                </label>
                <input
                  type="password"
                  required
                  value={forgotNewPass}
                  onChange={(e) => setForgotNewPass(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full h-10 px-3 rounded-xl bg-black/50 border border-white/10 text-white text-xs font-bold focus:outline-none focus:border-casino-gold"
                />
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="text-[10px] font-bold uppercase text-white/50 block mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={forgotConfirmPass}
                  onChange={(e) => setForgotConfirmPass(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full h-10 px-3 rounded-xl bg-black/50 border border-white/10 text-white text-xs font-bold focus:outline-none focus:border-casino-gold"
                />
              </div>

              <button
                type="submit"
                disabled={forgotBusy}
                className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-casino-gold to-orange-500 text-slate-950 font-black text-xs uppercase tracking-wider cursor-pointer shadow-lg hover:brightness-110 active:scale-95 transition-all"
              >
                {forgotBusy ? 'Resetting…' : 'Reset & Confirm Password'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
