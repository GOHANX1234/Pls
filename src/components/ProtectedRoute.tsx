import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedUserType: 'admin' | 'reseller' | 'any';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedUserType 
}) => {
  const { authState } = useAuth();
  
  if (!authState.isAuthenticated) {
    return <Navigate to="/" />;
  }
  
  if (allowedUserType !== 'any' && authState.userType !== allowedUserType) {
    // Redirect to appropriate dashboard based on user type
    if (authState.userType === 'admin') {
      return <Navigate to="/admin/dashboard" />;
    } else {
      return <Navigate to="/reseller/dashboard" />;
    }
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;