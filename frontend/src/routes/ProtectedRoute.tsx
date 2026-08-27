import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRoles }) => {
  const { usuario, accessToken } = useAuth();

  if (!accessToken || !usuario) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRoles && !requiredRoles.includes(usuario.rol)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
