import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../contexts/AuthContext';

// Validation schema
const schema = yup.object({
  email: yup.string()
    .required('Email is required')
    .email('Please enter a valid email address'),
  password: yup.string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters')
}).required();

const Login = () => {
  const { login, loginAttempts, isRateLimited } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(schema)
  });

  const onSubmit = async (data) => {
    if (isRateLimited) {
      setError('Too many login attempts. Please try again later.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await login(data.email, data.password);
      reset();
      navigate('/admin');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo-container">
            <div className="logo-icon">🔐</div>
          </div>
          <h1>Admin Portal</h1>
          <p>Secure access for Admin &amp; Super Admin</p>
          <p style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: 8 }}>
            Seed: admin@gmail.com / admin123
          </p>
        </div>

        <form className="login-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              id="email"
              type="email"
              className={`form-input ${errors.email ? 'error' : ''}`}
              {...register('email')}
              disabled={isRateLimited}
              placeholder="admin@gmail.com"
            />
            {errors.email && (
              <span className="error-message">
                {errors.email.message}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              id="password"
              type="password"
              className={`form-input ${errors.password ? 'error' : ''}`}
              {...register('password')}
              disabled={isRateLimited}
            />
            {errors.password && (
              <span className="error-message">
                {errors.password.message}
              </span>
            )}
          </div>

          {error && (
            <div className="error-alert">
              {error}
            </div>
          )}

          {loginAttempts > 0 && !isRateLimited && (
            <div className="attempts-warning">
              Login attempts: {loginAttempts}/5
            </div>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={isLoading || isRateLimited}
          >
            {isLoading ? (
              <div className="loading-spinner">
                ⟳
              </div>
            ) : (
              'Login'
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>Games Admin System v2.0</p>
        </div>
      </div>

      {/* Background effects */}
      <div className="background-effects">
        <div className="floating-shape shape-1" />
        <div className="floating-shape shape-2" />
        <div className="floating-shape shape-3" />
      </div>
    </div>
  );
};

export default Login;