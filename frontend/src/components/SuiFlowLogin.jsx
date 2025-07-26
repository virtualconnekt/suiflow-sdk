import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import './SuiFlowLogin.css';

// Icons
const SuiIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
    <line x1="9" y1="9" x2="9.01" y2="9"></line>
    <line x1="15" y1="9" x2="15.01" y2="9"></line>
  </svg>
);

const MailIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
    <polyline points="22,6 12,13 2,6"></polyline>
  </svg>
);

const LockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <circle cx="12" cy="16" r="1"></circle>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);

const EyeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const EyeOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
    <line x1="1" y1="1" x2="23" y2="23"></line>
  </svg>
);

const SuiFlowLogin = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isLogin) {
        // Login flow
        console.log('Attempting login...');
        const result = await authService.login(email, password);
        console.log('Login successful:', result);
        setSuccess('Login successful! Redirecting...');
        setTimeout(() => {
          console.log('Redirecting to dashboard...');
          navigate('/dashboard');
        }, 1000);
      } else {
        // Registration flow
        if (!showOtp) {
          // Send OTP
          console.log('Sending OTP...');
          await authService.sendRegistrationOTP(email);
          setShowOtp(true);
          setSuccess('OTP sent to your email!');
        } else {
          // Verify OTP and register
          console.log('Verifying OTP and registering...');
          const result = await authService.verifyOTPAndRegister(
            email, 
            otp, 
            password, 
            businessName, 
            walletAddress, 
            webhookUrl
          );
          console.log('Registration successful:', result);
          setSuccess('Registration successful! Redirecting...');
          setTimeout(() => {
            console.log('Redirecting to dashboard...');
            navigate('/dashboard');
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      await authService.resendOTP(email);
      setSuccess('OTP resent successfully!');
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="sui-login-container">
      <div className="sui-login-card">
        <div className="sui-login-header">
          <div className="sui-logo">
            {/* <img src={img02} alt="SuiFlow Logo" className="sui-logo-image" /> */}
          </div>
          <h1>{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
          <p>{isLogin ? 'Sign in to your SuiFlow dashboard' : 'Join the future of crypto payments'}</p>
        </div>

        <form onSubmit={handleSubmit} className="sui-login-form">
          <div className="sui-form-group">
            <label>
              <MailIcon />
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="sui-input"
              required
            />
          </div>

          {!isLogin && !showOtp && (
            <>
              <div className="sui-form-group">
                <label>Business Name</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Enter your business name"
                  className="sui-input"
                  required
                />
              </div>

              <div className="sui-form-group">
                <label>Sui Wallet Address</label>
                <input
                  type="text"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder="Enter your Sui wallet address"
                  className="sui-input"
                  required
                />
              </div>

              <div className="sui-form-group">
                <label>Webhook URL (Optional)</label>
                <input
                  type="url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://your-domain.com/webhook"
                  className="sui-input"
                />
              </div>
            </>
          )}

          {(!isLogin && showOtp) && (
            <div className="sui-form-group">
              <label>OTP Code</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                className="sui-input"
                required
                maxLength={6}
              />
              <button
                type="button"
                onClick={handleResendOTP}
                className="sui-link-button"
              >
                Resend OTP
              </button>
            </div>
          )}

          <div className="sui-form-group">
            <label>
              <LockIcon />
              Password
            </label>
            <div className="sui-password-input">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="sui-input"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="sui-password-toggle"
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          {error && <div className="sui-error">{error}</div>}
          {success && <div className="sui-success">{success}</div>}

          <button type="submit" className="sui-button sui-button-primary" disabled={loading}>
            {loading ? (
              <>
                <div className="sui-loading-spinner-small"></div>
                {isLogin ? 'Signing In...' : (showOtp ? 'Creating Account...' : 'Sending OTP...')}
              </>
            ) : (
              <>
                <SuiIcon />
                {isLogin ? 'Sign In' : (showOtp ? 'Create Account' : 'Send OTP')}
              </>
            )}
          </button>
        </form>

        <div className="sui-login-footer">
          <p>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setShowOtp(false);
                setError('');
                setSuccess('');
              }}
              className="sui-link-button"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SuiFlowLogin; 