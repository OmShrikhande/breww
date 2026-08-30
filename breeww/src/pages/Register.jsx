import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ReceiptText,
  Smartphone,
  UserRoundPlus,
} from 'lucide-react';
import AuthShell from '../components/auth/AuthShell';
import { pageHref, navigateTo } from '../lib/navigation';
import { useAuth } from '../context/AuthContext';

const methodOptions = [
  { id: 'phone', label: 'Phone number', icon: Smartphone, prefix: '+91' },
  { id: 'email', label: 'Email address', icon: Mail, prefix: null },
];

const agreementLabel = 'I have read and agree';

const AuthField = ({
  label,
  icon: IconComponent,
  type = 'text',
  placeholder,
  value,
  onChange,
  rightSlot,
  prefix,
}) => (
  <label className="block">
    <div className="mb-2 flex items-center gap-2 font-medium text-white">
      <IconComponent size={18} className="text-[#58acff]" />
      <span className="text-base">{label}</span>
    </div>
    <div className="flex gap-2">
      {prefix ? (
        <div className="flex h-[3.5rem] min-w-[4.8rem] items-center justify-center rounded-2xl bg-[#353d86] px-3 text-lg font-bold text-blue-100">
          {prefix}
        </div>
      ) : null}
      <div className="relative flex-1">
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="auth-input w-full pr-12"
          autoComplete={type === 'password' ? 'new-password' : 'username'}
        />
        {rightSlot ? (
          <div className="absolute inset-y-0 right-4 flex items-center text-white/60">{rightSlot}</div>
        ) : null}
      </div>
    </div>
  </label>
);

const Register = () => {
  const { register } = useAuth();
  const [method, setMethod] = useState('phone');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [agreed, setAgreed] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const selectedMethod = methodOptions.find((option) => option.id === method);

  const onSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');

    const raw = identifier.trim();
    if (!raw) {
      setError(method === 'phone' ? 'Please enter your 10-digit mobile number' : 'Please enter your email address');
      return;
    }
    if (method === 'phone' && raw.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    if (method === 'email' && !raw.includes('@')) {
      setError('Please enter a valid email address (e.g. user@example.com)');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!agreed) {
      setError('Please accept the privacy agreement');
      return;
    }

    setBusy(true);
    try {
      await register({ method, identifier: raw, password, inviteCode });
      navigateTo('/');
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Register"
      subtitle="Please register by phone number or email"
      icon={UserRoundPlus}
      sectionTitle={`Register with your ${method === 'phone' ? 'Phone Number' : 'Email'}`}
      altPrompt="Already have an account"
      altLinkLabel="Login"
      altLinkTo="/login"
    >
      <div className="grid grid-cols-2 gap-3 rounded-[1.4rem] bg-[#2b3270] p-1.5 mb-2">
        {methodOptions.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => {
              setMethod(option.id);
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
          placeholder={method === 'phone' ? 'Enter 10-digit mobile number' : 'Enter email (e.g. name@domain.com)'}
          prefix={selectedMethod.prefix}
          value={identifier}
          onChange={(event) => setIdentifier(event.target.value)}
        />

        <AuthField
          label="Set password"
          icon={LockKeyhole}
          type={showPassword ? 'text' : 'password'}
          placeholder="Set password (min 6 characters)"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
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

        <AuthField
          label="Confirm password"
          icon={LockKeyhole}
          type={showConfirmPassword ? 'text' : 'password'}
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          rightSlot={
            <button
              type="button"
              onClick={() => setShowConfirmPassword((value) => !value)}
              aria-label="Toggle confirm password visibility"
              className="hover:text-white transition-colors"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          }
        />

        <AuthField
          label="Invite code (Optional)"
          icon={ReceiptText}
          placeholder="Enter invite code (if any)"
          value={inviteCode}
          onChange={(event) => setInviteCode(event.target.value)}
        />

        <label className="mt-1 flex items-center gap-3 text-sm text-blue-50/80 cursor-pointer">
          <input
            type="checkbox"
            className="auth-checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
          />
          <span>{agreementLabel}</span>
          <a href={pageHref('/')} className="text-amber-400 transition hover:text-amber-300 ml-1">
            [Privacy Agreement]
          </a>
        </label>

        {error ? (
          <div className="rounded-xl bg-red-500/15 border border-red-500/30 px-3 py-2 text-xs font-semibold text-red-200">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          className="auth-primary-button mt-2 w-full"
          disabled={busy}
        >
          {busy ? 'Creating account…' : 'Register'}
        </button>
      </form>
    </AuthShell>
  );
};

export default Register;
