import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

const useAuthMock = vi.fn();
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => useAuthMock(),
}));

import { ProtectedRoute } from '@/routes/ProtectedRoute';

function renderWithRoute(initialPath: string, requiredRoles?: string[] | undefined) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route
          path="/protegida"
          element={
            <ProtectedRoute requiredRoles={requiredRoles}>
              <div>Contenido Protegido</div>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<div>Pagina de Login</div>} />
        <Route path="/unauthorized" element={<div>Sin Permiso</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  it('no debería redirigir mientras isInitializing es true, aunque no haya token todavía', () => {
    useAuthMock.mockReturnValue({ usuario: null, accessToken: null, isInitializing: true });
    renderWithRoute('/protegida');

    expect(screen.queryByText('Pagina de Login')).not.toBeInTheDocument();
    expect(screen.queryByText('Contenido Protegido')).not.toBeInTheDocument();
  });

  it('debería redirigir a /login si no hay accessToken', () => {
    useAuthMock.mockReturnValue({ usuario: null, accessToken: null, isInitializing: false });
    renderWithRoute('/protegida');

    expect(screen.getByText('Pagina de Login')).toBeInTheDocument();
  });

  it('debería redirigir a /unauthorized si el rol no está permitido', () => {
    useAuthMock.mockReturnValue({
      usuario: { rol: 'OPERADOR' },
      accessToken: 'token',
    });
    renderWithRoute('/protegida', ['SUPERVISOR', 'ADMIN']);

    expect(screen.getByText('Sin Permiso')).toBeInTheDocument();
  });

  it('debería renderizar el contenido si hay token y el rol está permitido', () => {
    useAuthMock.mockReturnValue({
      usuario: { rol: 'SUPERVISOR' },
      accessToken: 'token',
    });
    renderWithRoute('/protegida', ['SUPERVISOR', 'ADMIN']);

    expect(screen.getByText('Contenido Protegido')).toBeInTheDocument();
  });

  it('debería renderizar el contenido si no se especifican roles requeridos', () => {
    useAuthMock.mockReturnValue({
      usuario: { rol: 'CUALQUIERA' },
      accessToken: 'token',
    });
    renderWithRoute('/protegida');

    expect(screen.getByText('Contenido Protegido')).toBeInTheDocument();
  });
});
