import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import './Login.css';

const CandidateLogin = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    mobile: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login, isAuthenticated, user } = useAuth();
  const { showError, showSuccess } = useNotification();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    if (!formData.username || !formData.password || !formData.mobile) {
      showError('Please fill in all fields');
      setLoading(false);
      return;
    }

    const credentials = {
      username: formData.username.trim(),
      password: formData.password,
      mobile: formData.mobile.trim(),
    };

    try {
      const result = await login(credentials);
      
      if (result.success) {
        showSuccess('Login successful!');
      } else {
        const errorMessage = result.error || 'Login failed. Please check your credentials.';
        showError(errorMessage);
        console.error('Login failed:', errorMessage);
      }
    } catch (error) {
      const errorMessage = error?.response?.data?.error || error.message || 'Login failed. Please try again.';
      showError(errorMessage);
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Redirect if already authenticated
  if (isAuthenticated && user) {
    const redirectPath = user.role === 'admin' ? '/admin' : '/candidate';
    return <Navigate to={redirectPath} replace />;
  }

  return (
    <div className="login-container">
      <div className="login-card candidate-login">
        <div className="login-header">
          <h1>Candidate Portal</h1>
          <p>Access Your Tasks & Assignments</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              className="form-control"
              value={formData.username}
              onChange={handleInputChange}
              disabled={loading}
              placeholder="Enter your username"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-group">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                className="form-control"
                value={formData.password}
                onChange={handleInputChange}
                disabled={loading}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="mobile">Mobile Number</label>
            <input
              type="tel"
              id="mobile"
              name="mobile"
              className="form-control"
              value={formData.mobile}
              onChange={handleInputChange}
              disabled={loading}
              placeholder="Enter your mobile number (as registered)"
              required
            />
            <small className="form-text text-muted">
              Required for account verification - must match registered number
            </small>
          </div>

          <button
            type="submit"
            className="btn btn-primary login-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>

        <div className="login-actions">
          <button
            type="button"
            className="btn btn-link"
            onClick={() => navigate('/admin')}
          >
            ← Admin Login
          </button>
          <button
            type="button"
            className="btn btn-link"
            onClick={() => navigate('/login-selection')}
          >
            Switch Portal
          </button>
        </div>

        <div className="login-info">
          <div className="info-card">
            <h4>📋 Your Responsibilities</h4>
            <ul>
              <li>Download assigned tasks</li>
              <li>Complete work offline</li>
              <li>Submit before deadline</li>
              <li>Track submission status</li>
            </ul>
          </div>
          
          <div className="info-card">
            <h4>🔐 Security Note</h4>
            <p>Your credentials are confidential. Never share your password.</p>
            <p>Contact your administrator if you forget your credentials.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateLogin;
