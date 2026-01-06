import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, role, loginComponent }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  // If not authenticated, show the login component
  if (!isAuthenticated) {
    return loginComponent || <Navigate to="/login-selection" replace />;
  }

  // Check if user has the required role
  if (role && user?.role !== role) {
    // Redirect to appropriate dashboard based on user role
    const redirectPath = user?.role === 'admin' ? '/admin' : '/candidate';
    return <Navigate to={redirectPath} replace />;
  }

  // User is authenticated with correct role, show the protected content
  return children;
};

export default ProtectedRoute;