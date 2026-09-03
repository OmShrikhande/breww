import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  Smartphone,
  Mail,
  LogIn,
  CheckCircle2,
  Headphones,
  Crown,
} from 'lucide-react';
import { navigateTo } from '../lib/navigation';
import { useAuth } from '../context/AuthContext';
import { useAudio } from '../context/AudioContext';

const Login = () => {
  const { login } = useAuth();
  const { playWin, playChip } = useAudio();

  const [method, setMethod] = useState('phone');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

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

          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">Player Login</h1>
          <p className="text-xs text-amber-200/70 mt-1">Log in with your phone or email to play and win</p>
        </div>

        {/* Method Toggle Tab */}
        <div className="p-6 space-y-4">
          <div className="flex bg-black/60 p-1 rounded-2xl border border-amber-500/30 gap-1 shadow-inner">
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
                  ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-red-950 border border-white/80 shadow-md font-black'
                  : 'text-white/60 hover:text-white'
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
                  ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-red-950 border border-white/80 shadow-md font-black'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Mail size={14} /> Email Login
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-2xl bg-red-950/60 border border-red-500/40 text-red-400 text-xs font-bold animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            {/* Identifier input */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-amber-300/80 mb-1.5">
                {method === 'phone' ? 'Phone Number' : 'Email Address'}
              </label>
              <div className="flex gap-2">
                {method === 'phone' && (
                  <div className="h-12 px-3.5 rounded-2xl bg-black/60 border border-amber-500/30 flex items-center justify-center font-black text-sm text-amber-400 shrink-0">
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
                  className="flex-1 h-12 px-4 rounded-2xl bg-black/60 border border-amber-500/30 text-white font-bold text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-amber-300/80 mb-1.5 flex items-center justify-between">
                <span>Login Password</span>
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

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs text-amber-100/70 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-black/50 border-amber-500/30 text-amber-400 focus:ring-amber-400 cursor-pointer"
                />
                Remember me
              </label>
            </div>

            {/* Login Submit Button */}
            <button
              type="submit"
              disabled={busy}
              className="w-full h-13 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-red-950 font-black text-sm uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 border-2 border-white/80"
            >
              {busy ? (
                <div className="w-5 h-5 border-2 border-red-950 border-t-transparent rounded-full animate-spin" />
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
              className="text-xs font-bold text-white/70 hover:text-white transition-colors cursor-pointer"
            >
              Don't have an account?{' '}
              <span className="text-amber-400 font-black underline">Register Now</span>
            </button>
          </div>
        </div>

        {/* Security Footer Note */}
        <div className="p-4 bg-black/50 border-t border-amber-500/20 text-center text-[10px] text-white/50 font-medium">
          🔒 256-Bit SSL Encrypted · Provably Fair Gaming Engine
        </div>
      </div>
    </div>
  );
};

export default Login;
