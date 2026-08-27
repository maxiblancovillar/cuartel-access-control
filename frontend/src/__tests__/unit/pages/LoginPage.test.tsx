import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { LoginPage } from '@/features/auth/pages/LoginPage';

const navigateMock = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

const loginMock = vi.fn();
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ login: loginMock }),
}));

function renderLoginPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debería renderizar el formulario con usuario y contraseña', () => {
    renderLoginPage();

    expect(screen.getByPlaceholderText('guardia_001')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ingresar/i })).toBeInTheDocument();
  });

  it('debería mostrar errores de validación con datos inválidos', async () => {
    renderLoginPage();

    await userEvent.click(screen.getByRole('button', { name: /ingresar/i }));

    await waitFor(() => {
      expect(screen.getByText(/Usuario mínimo 3 caracteres/i)).toBeInTheDocument();
      expect(screen.getByText(/Contraseña mínimo 8 caracteres/i)).toBeInTheDocument();
    });
    expect(loginMock).not.toHaveBeenCalled();
  });

  it('debería llamar a login y redirigir a /access si el rol es OPERADOR', async () => {
    loginMock.mockResolvedValueOnce({ rol: 'OPERADOR' });
    renderLoginPage();

    await userEvent.type(screen.getByPlaceholderText('guardia_001'), 'guardia_001');
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'Password123!');
    await userEvent.click(screen.getByRole('button', { name: /ingresar/i }));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith('guardia_001', 'Password123!');
    });
    expect(navigateMock).toHaveBeenCalledWith('/access');
  });

  it('debería redirigir a /dashboard si el rol es SUPERVISOR', async () => {
    loginMock.mockResolvedValueOnce({ rol: 'SUPERVISOR' });
    renderLoginPage();

    await userEvent.type(screen.getByPlaceholderText('guardia_001'), 'supervisor_001');
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'Password123!');
    await userEvent.click(screen.getByRole('button', { name: /ingresar/i }));

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('debería mostrar un mensaje de error si login falla', async () => {
    loginMock.mockRejectedValueOnce({
      response: { data: { message: 'Usuario o contraseña inválidos' } },
    });
    renderLoginPage();

    await userEvent.type(screen.getByPlaceholderText('guardia_001'), 'guardia_001');
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'WrongPassword');
    await userEvent.click(screen.getByRole('button', { name: /ingresar/i }));

    await waitFor(() => {
      expect(screen.getByText('Usuario o contraseña inválidos')).toBeInTheDocument();
    });
    expect(navigateMock).not.toHaveBeenCalled();
  });
});
