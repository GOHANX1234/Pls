import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Pages
import AdminLogin from './pages/AdminLogin';
import LoginSelector from './pages/LoginSelector';
import ResellerLogin from './pages/ResellerLogin';
import ResellerRegistration from './pages/ResellerRegistration';
import AdminDashboard from './pages/AdminDashboard';
import ResellerDashboard from './pages/ResellerDashboard';

// Components
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<AdminLogin />} />
          <Route path="/select" element={<LoginSelector />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/reseller/login" element={<ResellerLogin />} />
          <Route path="/reseller/register" element={<ResellerRegistration />} />
          
          {/* Protected Routes */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute allowedUserType="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/reseller/dashboard" 
            element={
              <ProtectedRoute allowedUserType="reseller">
                <ResellerDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;