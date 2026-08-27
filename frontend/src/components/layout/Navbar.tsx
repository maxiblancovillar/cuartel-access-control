import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '../ui/Button';
import { useNavigate } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">🛡️ Control de Acceso</h1>
          <p className="text-sm text-gray-300">Cuartel El Palomar</p>
        </div>
        {usuario && (
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-sm font-semibold">{usuario.nombreCompleto}</p>
              <p className="text-xs text-gray-400">{usuario.rol}</p>
            </div>
            <Button variant="secondary" size="sm" onClick={handleLogout}>
              Cerrar Sesión
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};
