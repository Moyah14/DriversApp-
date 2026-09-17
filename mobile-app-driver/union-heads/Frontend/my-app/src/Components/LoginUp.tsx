import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/client';
import './Login.css';
import image from './media/image0 (1) 2.png';

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('unionhead1@plateau.ng');
  const [password, setPassword] = useState('Password123!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg">
      <form className="login-card" onSubmit={handleSubmit}>
        <img
          src={image}
          alt="Government Logo"
          className="login-logo"
        />
        <h2 className="login-title">Welcome Back!</h2>
        <p className="login-subtext">
          Login to your account with your details.
        </p>
        {error && (
          <p style={{ color: '#b91c1c', fontSize: 14, marginBottom: 12, width: '100%' }}>
            {error}
          </p>
        )}
        <div style={{ width: '100%', marginBottom: '1.25rem' }}>
          <label htmlFor="email" className="login-label">
            Email Address*
          </label>
          <input
            id="email"
            type="email"
            placeholder="Type email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="login-input"
          />
        </div>
        <div style={{ width: '100%', marginBottom: '0.5rem', position: 'relative' }}>
          <label htmlFor="password" className="login-label">
            Password*
          </label>
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Type password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="login-input login-input-password"
          />
          <button
            type="button"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            onClick={() => setShowPassword(s => !s)}
            className="login-password-toggle"
          >
            {showPassword ? (
              <span role="img" aria-label="Hide">🙈</span>
            ) : (
              <span role="img" aria-label="Show">👁️</span>
            )}
          </button>
        </div>
        <div style={{ width: '100%', textAlign: 'right', marginBottom: '1.5rem' }}>
          <a href="#forgot" className="login-forgot">
            Forgot Password?
          </a>
        </div>
        <button type="submit" className="login-signin-btn" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
    </div>
  );
};

export default Login;
