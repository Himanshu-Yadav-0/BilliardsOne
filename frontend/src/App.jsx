import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Import all page components
import LoginPage from './pages/LoginPage';
import OwnerDashboard from './pages/OwnerDashboard';
import StaffDashboard from './pages/StaffDashboard';
import CafeManagementPage from './pages/CafeManagementPage';
import OwnerAnalyticsPage from './pages/OwnerAnalyticsPage';
import StaffPaymentsHistory from './pages/StaffPaymentsHistory';
import StaffDailyAnalytics from './pages/StaffDailyAnalytics';

const AppContent = () => {
  const { user, loading } = useAuth();

  // Show a loading screen while the app checks for a stored token
  if (loading) {
    return (
      <div className="bg-gray-900 min-h-screen flex items-center justify-center">
        <p className="text-white text-xl">Loading application...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
      
      {/* --- Owner Routes (Protected) --- */}
      <Route 
        path="/owner/dashboard" 
        element={user && user.role === 'owner' ? <OwnerDashboard /> : <Navigate to="/login" />}
      />
      <Route 
        path="/owner/manage-cafe"
        element={user && user.role === 'owner' ? <CafeManagementPage /> : <Navigate to="/login" />}
      />
      <Route 
        path="/owner/analytics"
        element={user && user.role === 'owner' ? <OwnerAnalyticsPage /> : <Navigate to="/login" />}
      />

      {/* --- Staff Routes (Protected) --- */}
      <Route 
        path="/staff/dashboard" 
        element={user && user.role === 'staff' ? <StaffDashboard /> : <Navigate to="/login" />}
      />
       <Route 
        path="/staff/payments" 
        element={user && user.role === 'staff' ? <StaffPaymentsHistory /> : <Navigate to="/login" />}
      />
      <Route 
        path="/staff/analytics" 
        element={user && user.role === 'staff' ? <StaffDailyAnalytics /> : <Navigate to="/login" />}
      />
      
      {/* --- Root Redirect Logic --- */}
      <Route 
        path="/" 
        element={
          user ? (
            user.role === 'owner' ? <Navigate to="/owner/dashboard" /> : <Navigate to="/staff/dashboard" />
          ) : (
            <Navigate to="/login" />
          )
        } 
      />
      
      {/* Catch-all for any unknown paths */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

// The main App component wraps everything in the Router and AuthProvider
const App = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;

