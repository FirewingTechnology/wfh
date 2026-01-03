import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    mobile: '',
  });
  const [showMobile, setShowMobile] = useState(false);

  const { login, isAuthenticated, user, loading, error } = useAuth();
  const { showError, showSuccess } = useNotification();

  useEffect(() => {
    if (error) {
      showError(error);
    }
  }, [error, showError]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Show mobile field when username is entered (for potential candidates)
    if (name === 'username' && value.trim() && !showMobile) {
      setShowMobile(true);
    } else if (name === 'username' && !value.trim()) {
      setShowMobile(false);
      setFormData(prev => ({ ...prev, mobile: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      showError('Please fill in all required fields');
      return;
    }

    const credentials = {
      username: formData.username.trim(),
      password: formData.password,
    };

    // Include mobile for potential candidates
    if (formData.mobile) {
      credentials.mobile = formData.mobile.trim();
    }

    const result = await login(credentials);
    
    if (result.success) {
      showSuccess('Login successful!');
    }
  };

  // Redirect based on user role
  if (isAuthenticated && user) {
    const redirectPath = user.role === 'admin' ? '/admin' : '/candidate';
    return <Navigate to={redirectPath} replace />;
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Admin-Candidate Workflow</h1>
          <p>Secure Desktop Application</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username / Email</label>
            <input
              type="text"
              id="username"
              name="username"
              className="form-control"
              value={formData.username}
              onChange={handleInputChange}
              required
              disabled={loading}
              placeholder="Enter your username or email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-control"
              value={formData.password}
              onChange={handleInputChange}
              required
              disabled={loading}
              placeholder="Enter your password"
            />
          </div>

          {showMobile && (
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
                placeholder="Enter your mobile number (for candidates)"
              />
              <small className="form-text">
                Required for candidate accounts. Leave empty if you're an admin.
              </small>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary login-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner" style={{ width: '16px', height: '16px' }}></div>
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>

        <div className="login-info">
          <div className="info-card">
            <h3>Default Admin Credentials</h3>
            <p><strong>Username:</strong> admin</p>
            <p><strong>Password:</strong> admin123</p>
            <small>These are default credentials for testing purposes.</small>
          </div>
          
          <div className="info-card">
            <h3>For Candidates</h3>
            <p>Your credentials will be provided by the administrator.</p>
            <p>Mobile number verification is required for candidate accounts.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;