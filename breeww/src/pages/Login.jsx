import React, { useState } from 'react';
import { Eye, EyeOff, LockKeyhole, Mail, LogIn, Smartphone } from 'lucide-react';
import AuthShell from '../components/auth/AuthShell';
import { useAuth } from '../context/AuthContext';
import { navigateTo } from '../lib/navigation';

const methodOptions = [
  { id: 'phone', label: 'Phone number', icon: Smartphone, prefix: '+91' },
  { id: 'email', label: 'Email address', icon: Mail, prefix: '@' },
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
}) => (
  <label className="block">
    <div className="mb-3 flex items-center gap-2 font-medium text-white">
      <Icon size={18} className="text-[#58acff]" />
      <span className="text-lg">{label}</span>
    </div>
    <div className="flex gap-3">
      {prefix ? (
        <div className="flex h-[3.75rem] min-w-[6.2rem] items-center justify-center rounded-2xl bg-[#353d86] px-4 text-xl text-blue-100/90">
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

  const onSubmit = async () => {
    setError('');
    setBusy(true);
    try {
      await login({ method, identifier, password });
      navigateTo('/');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Login"
      subtitle="Sign in with your phone number or email"
      icon={LogIn}
      sectionTitle={`Login with your ${method}`}
      altPrompt="No account yet"
      altLinkLabel="Register"
      altLinkTo="/register"
    >
      <div className="grid grid-cols-2 gap-3 rounded-[1.4rem] bg-[#2b3270] p-1.5">
        {methodOptions.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setMethod(option.id)}
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

      <AuthField
        label={selectedMethod.label}
        icon={selectedMethod.icon}
        placeholder={`Please enter the ${method === 'phone' ? 'phone number' : 'email address'}`}
        prefix={selectedMethod.prefix}
        value={identifier}
        onChange={(event) => setIdentifier(event.target.value)}
      />

      <AuthField
        label="Password"
        icon={LockKeyhole}
        type={showPassword ? 'text' : 'password'}
        placeholder="Enter password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        rightSlot={
          <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label="Toggle password visibility">
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        }
      />

      {error ? <p className="text-sm text-red-300">{error}</p> : null}

      <button
        type="button"
        className="auth-primary-button mt-4 w-full"
        disabled={busy}
        onClick={onSubmit}
      >
        {busy ? 'Signing in…' : 'Login'}
      </button>
    </AuthShell>
  );
};

export default Login;
