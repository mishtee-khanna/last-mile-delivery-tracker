import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, AuthProvider } from './AuthContext';
import Login from './pages/Login';
import CustomerDashboard from './pages/CustomerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AgentDashboard from './pages/AgentDashboard';
import Navbar from './components/Navbar';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" />;
  return children;
};

const AppContent = () => {
  const { user } = useContext(AuthContext);

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={!user ? <Login /> : <Navigate to={`/${user.role.toLowerCase()}`} />} />
        
        <Route path="/customer" element={
          <ProtectedRoute allowedRoles={['CUSTOMER']}>
            <CustomerDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/agent" element={
          <ProtectedRoute allowedRoles={['AGENT']}>
            <AgentDashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;
