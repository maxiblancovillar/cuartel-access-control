import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[] | undefined;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRoles }) => {
  const { usuario, accessToken, isInitializing } = useAuth();

  // Esperar a que AuthContext termine de rehidratar la sesión desde
  // localStorage antes de decidir si redirigir a /login. Sin esto, recargar
  // la página en una ruta protegida expulsaba a un usuario con sesión válida.
  if (isInitializing) {
    return null;
  }

  if (!accessToken || !usuario) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRoles && !requiredRoles.includes(usuario.rol)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
