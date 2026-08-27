import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const navigateMock = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => navigateMock };
});

const logoutMock = vi.fn();
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    usuario: { nombreCompleto: 'Juan Perez', rol: 'OPERADOR' },
    logout: logoutMock,
  }),
}));

import { Navbar } from '@/components/layout/Navbar';

describe('Navbar', () => {
  it('debería mostrar el nombre y rol del usuario autenticado', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    expect(screen.getByText('Juan Perez')).toBeInTheDocument();
    expect(screen.getByText('OPERADOR')).toBeInTheDocument();
  });

  it('debería llamar logout y navegar a /login al hacer click en Cerrar Sesión', async () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    await userEvent.click(screen.getByRole('button', { name: /cerrar sesión/i }));

    expect(logoutMock).toHaveBeenCalledOnce();
    expect(navigateMock).toHaveBeenCalledWith('/login');
  });
});
