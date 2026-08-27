import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const useAuthMock = vi.fn();
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => useAuthMock(),
}));

import { Sidebar } from '@/components/layout/Sidebar';

describe('Sidebar', () => {
  it('debería mostrar solo "Registrar Acceso" para rol OPERADOR', () => {
    useAuthMock.mockReturnValue({ usuario: { rol: 'OPERADOR' } });
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );

    expect(screen.getByText(/Registrar Acceso/i)).toBeInTheDocument();
    expect(screen.queryByText(/Dashboard/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Administración/i)).not.toBeInTheDocument();
  });

  it('debería mostrar Dashboard y Reportes para rol SUPERVISOR', () => {
    useAuthMock.mockReturnValue({ usuario: { rol: 'SUPERVISOR' } });
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );

    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Reportes/i)).toBeInTheDocument();
    expect(screen.queryByText(/Registrar Acceso/i)).not.toBeInTheDocument();
  });

  it('debería mostrar todos los items para rol ADMIN', () => {
    useAuthMock.mockReturnValue({ usuario: { rol: 'ADMIN' } });
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );

    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Reportes/i)).toBeInTheDocument();
    expect(screen.getByText(/Administración/i)).toBeInTheDocument();
  });

  it('no debería mostrar ningún item si no hay usuario', () => {
    useAuthMock.mockReturnValue({ usuario: null });
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );

    expect(screen.queryByText(/Registrar Acceso/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Dashboard/i)).not.toBeInTheDocument();
  });
});
