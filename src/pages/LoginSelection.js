import React from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const LoginSelection = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  // Redirect if already authenticated
  if (isAuthenticated && user) {
    const redirectPath = user.role === 'admin' ? '/admin' : '/candidate';
    return <Navigate to={redirectPath} replace />;
  }

  return (
    <div className="login-container">
      <div className="login-card selection-card">
        <div className="login-header">
          <h1>Admin-Candidate Workflow</h1>
          <p>Secure Desktop Application</p>
        </div>

        <div className="selection-content">
          <p className="selection-title">Select Your Portal</p>
          
          <div className="selection-buttons">
            <button
              className="selection-btn admin-btn"
              onClick={() => navigate('/admin')}
            >
              <div className="btn-icon">👤</div>
              <div className="btn-content">
                <h3>Admin Portal</h3>
                <p>Manage candidates and assign tasks</p>
              </div>
            </button>

            <button
              className="selection-btn candidate-btn"
              onClick={() => navigate('/candidate')}
            >
              <div className="btn-icon">📋</div>
              <div className="btn-content">
                <h3>Candidate Portal</h3>
                <p>Access tasks and submit work</p>
              </div>
            </button>
          </div>
        </div>

        <div className="login-info">
          <div className="info-card">
            <h4>🔐 Security First</h4>
            <p>Your data is encrypted and secured with JWT tokens stored in SQLite.</p>
          </div>
          
          <div className="info-card">
            <h4>❓ Need Help?</h4>
            <p>Contact your administrator for login credentials and support.</p>
            <p style={{ marginTop: '10px', fontSize: '13px' }}>
              <strong>Testing?</strong> Use <a href="/demo-setup" style={{ color: '#667eea', textDecoration: 'none' }}>demo setup</a> for test credentials.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginSelection;
