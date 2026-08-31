import React, { useState } from 'react';
import { Eye, EyeOff, LockKeyhole, Mail, LogIn, Smartphone } from 'lucide-react';
import AuthShell from '../components/auth/AuthShell';
import { useAuth } from '../context/AuthContext';
import { navigateTo } from '../lib/navigation';

const methodOptions = [
  { id: 'phone', label: 'Phone number', icon: Smartphone, prefix: '+91' },
  { id: 'email', label: 'Email address', icon: Mail, prefix: null },
];

const AuthField = ({
  label,
  icon: Icon,
  type = 'text',
  placeholder,
  value,
  onChange,
  prefix,
  rightSlot,
  maxLength,
  inputMode,
}) => (
  <label className="block">
    <div className="mb-2 flex items-center gap-2 font-medium text-white">
      <Icon size={18} className="text-[#58acff]" />
      <span className="text-base">{label}</span>
    </div>
    <div className="flex gap-2">
      {prefix ? (
        <div className="flex h-[3.5rem] min-w-[4.8rem] items-center justify-center rounded-2xl bg-[#353d86] px-3 text-lg font-bold text-blue-100 select-none">
          {prefix}
        </div>
      ) : null}
      <div className="relative flex-1">
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          maxLength={maxLength}
          inputMode={inputMode}
          className="auth-input w-full pr-12"
          autoComplete={type === 'password' ? 'current-password' : 'username'}
        />
        {rightSlot ? (
          <div className="absolute inset-y-0 right-4 flex items-center text-white/60">{rightSlot}</div>
        ) : null}
      </div>
    </div>
  </label>
);

const Login = () => {
  const { login } = useAuth();
  const [method, setMethod] = useState('phone');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const selectedMethod = methodOptions.find((option) => option.id === method);

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
      const digits = raw.replace(/\D/g, '');
      if (digits.length !== 10) {
        setError('Mobile number must be exactly 10 digits (e.g. 9876543210)');
        return;
      }
      if (!/^[6-9]\d{9}$/.test(digits)) {
        setError('Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9');
        return;
      }
    } else {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(raw)) {
        setError('Please enter a valid email address (e.g. name@domain.com)');
        return;
      }
    }

    if (!password) {
      setError('Please enter your password');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setBusy(true);
    try {
      await login({ method, identifier: raw, password });
      navigateTo('/');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Login"
      subtitle="Sign in with your phone number or email"
      icon={LogIn}
      sectionTitle={`Login with your ${method === 'phone' ? 'Phone Number' : 'Email'}`}
      altPrompt="No account yet"
      altLinkLabel="Register"
      altLinkTo="/register"
    >
      <div className="grid grid-cols-2 gap-3 rounded-[1.4rem] bg-[#2b3270] p-1.5 mb-2">
        {methodOptions.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => {
              setMethod(option.id);
              setIdentifier('');
              setError('');
            }}
            className={`rounded-[1rem] px-4 py-3 text-sm font-semibold transition ${
              method === option.id
                ? 'bg-[#4aa4ff] text-white shadow-[0_10px_24px_rgba(53,134,255,0.35)]'
                : 'text-blue-100/70 hover:bg-white/5'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <AuthField
          label={selectedMethod.label}
          icon={selectedMethod.icon}
          type={method === 'phone' ? 'tel' : 'email'}
          inputMode={method === 'phone' ? 'numeric' : 'email'}
          maxLength={method === 'phone' ? 10 : 100}
          placeholder={method === 'phone' ? 'Enter 10-digit mobile number' : 'Enter email (e.g. name@domain.com)'}
          prefix={selectedMethod.prefix}
          value={identifier}
          onChange={handleIdentifierChange}
        />

        <AuthField
          label="Password"
          icon={LockKeyhole}
          type={showPassword ? 'text' : 'password'}
          placeholder="Enter password"
          maxLength={32}
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            setError('');
          }}
          rightSlot={
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label="Toggle password visibility"
              className="hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          }
        />

        {error ? (
          <div className="rounded-xl bg-red-500/15 border border-red-500/30 px-3 py-2 text-xs font-semibold text-red-200 animate-fadeIn">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          className="auth-primary-button mt-2 w-full"
          disabled={busy}
        >
          {busy ? 'Signing in…' : 'Login'}
        </button>
      </form>
    </AuthShell>
  );
};

export default Login;
