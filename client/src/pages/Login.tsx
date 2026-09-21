import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Signal, Eye, EyeOff, Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Email address is required.');
      return;
    }
    if (!password) {
      setError('Password is required.');
      return;
    }

    setIsLoading(true);
    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(
        axiosErr?.response?.data?.message ||
          'Login failed. Please check your credentials and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page grid-bg">
      {/* Background glows */}
      <div className="login-glow login-glow-1" />
      <div className="login-glow login-glow-2" />

      {/* Signal rings decoration */}
      <div className="login-rings">
        <div className="login-ring login-ring-1" />
        <div className="login-ring login-ring-2" />
        <div className="login-ring login-ring-3" />
      </div>

      {/* Card */}
      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-icon">
            <Signal size={24} color="var(--color-accent-blue)" />
          </div>
          <div>
            <div className="login-logo-title">TowerOps</div>
            <div className="login-logo-sub">Telecom Tower Management System</div>
          </div>
        </div>

        {/* Heading */}
        <div className="login-heading">
          <h1>Welcome Back</h1>
          <p>Sign in to access the Operations Center</p>
        </div>

        {/* Error */}
        {error && (
          <div className="login-error" role="alert">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form" noValidate>
          {/* Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <Mail size={16} className="input-icon" />
              <input
                id="email"
                type="email"
                className={`form-input input-with-icon ${error && !email ? 'error' : ''}`}
                placeholder="admin@telecom.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                autoComplete="email"
                autoFocus
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div className="input-wrapper">
              <Lock size={16} className="input-icon" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className={`form-input input-with-icon input-with-icon-right ${error && !password ? 'error' : ''}`}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                autoComplete="current-password"
                disabled={isLoading}
              />
              <button
                type="button"
                className="input-icon-right"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            id="login-submit-btn"
            type="submit"
            className="btn btn-primary btn-lg login-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="spin-icon" />
                Authenticating...
              </>
            ) : (
              'Sign In to Operations Center'
            )}
          </button>
        </form>

        {/* Demo credentials */}
        <div className="login-demo">
          <div className="demo-divider">
            <span>Demo Credentials</span>
          </div>
          <div className="demo-creds">
            {[
              { role: 'Admin', email: 'admin@telecom.com', password: 'Admin@1234' },
              { role: 'Operator', email: 'operator@telecom.com', password: 'Operator@1234' },
              { role: 'Technician', email: 'priya@telecom.com', password: 'Tech@1234' },
            ].map(({ role, email: credEmail, password: credPass }) => (
              <button
                key={role}
                type="button"
                className="demo-cred-btn"
                onClick={() => {
                  setEmail(credEmail);
                  setPassword(credPass);
                  setError('');
                }}
                disabled={isLoading}
              >
                <span className="demo-role">{role}</span>
                <span className="demo-email">{credEmail}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <p className="login-footer-note">
          Secured with JWT authentication • Run{' '}
          <code>npm run seed</code> in server/ to create demo accounts
        </p>
      </div>
    </div>
  );
};

export default Login;
