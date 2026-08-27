import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { useAuth } from '@/context/AuthContext';

export const Sidebar: React.FC = () => {
  const { usuario } = useAuth();
  const location = useLocation();

  const menuItems = [
    { path: '/access', label: '📋 Registrar Acceso', roles: ['OPERADOR'] },
    {
      path: '/dashboard',
      label: '📊 Dashboard',
      roles: ['SUPERVISOR', 'ADMIN'],
    },
    { path: '/reports', label: '📄 Reportes', roles: ['SUPERVISOR', 'ADMIN'] },
    { path: '/admin', label: '⚙️ Administración', roles: ['ADMIN'] },
  ];

  const availableMenu = menuItems.filter((item) => item.roles.includes(usuario?.rol || ''));

  return (
    <aside className="w-64 bg-gray-800 text-white shadow-lg h-full">
      <div className="p-4">
        <h2 className="text-lg font-bold mb-6">Menú</h2>
        <nav className="space-y-2">
          {availableMenu.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={clsx(
                'block px-4 py-3 rounded-lg transition-colors',
                location.pathname === item.path
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
};
