import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';

// Pages
import { LoginPage } from './features/auth/pages/LoginPage';
import { AccessControlPage } from './features/access/pages/AccessControlPage';
import { DashboardPage } from './features/dashboard/pages/DashboardPage';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/unauthorized"
            element={
              <div className="flex items-center justify-center h-screen">
                No tienes permiso para acceder
              </div>
            }
          />

          <Route
            path="/access"
            element={
              <ProtectedRoute requiredRoles={['OPERADOR']}>
                <AccessControlPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requiredRoles={['SUPERVISOR', 'ADMIN']}>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
