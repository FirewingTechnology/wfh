import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import LoginSelection from './pages/LoginSelection';
import Login from './pages/Login';
import CandidateLogin from './pages/CandidateLogin';
import DemoSetup from './pages/DemoSetup';
import AdminDashboard from './pages/AdminDashboard';
import CandidateDashboard from './pages/CandidateDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Notifications from './components/Notifications';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <div className="App">
            <Notifications />
            <Routes>
              {/* Portal Selection */}
              <Route path="/login-selection" element={<LoginSelection />} />

              {/* Demo Setup */}
              <Route path="/demo-setup" element={<DemoSetup />} />

              {/* Admin Routes - /admin shows login or dashboard */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute 
                    role="admin"
                    loginComponent={<Login />}
                  >
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />

              {/* Candidate Routes - /candidate shows login or dashboard */}
              <Route 
                path="/candidate" 
                element={
                  <ProtectedRoute 
                    role="candidate"
                    loginComponent={<CandidateLogin />}
                  >
                    <CandidateDashboard />
                  </ProtectedRoute>
                } 
              />

              {/* Default redirect to selection */}
              <Route path="/" element={<Navigate to="/login-selection" replace />} />
              <Route path="/login" element={<Navigate to="/login-selection" replace />} />
            </Routes>
          </div>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;