import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthProvider, useAuth } from '@/context/AuthContext';

// Mock del cliente axios usado por los hooks de auth
vi.mock('@/api/axiosConfig', () => ({
  default: {
    post: vi.fn(),
  },
  setAccessToken: vi.fn(),
  getAccessToken: vi.fn(),
}));

import axiosInstance from '@/api/axiosConfig';

function renderWithProviders() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
  return renderHook(() => useAuth(), { wrapper });
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('debería retornar usuario null y sin token inicialmente si no hay sesión guardada', () => {
    const { result } = renderWithProviders();

    expect(result.current.usuario).toBeNull();
    expect(result.current.accessToken).toBeNull();
  });

  it('debería cargar usuario y token desde localStorage si existen', async () => {
    const mockUsuario = {
      id: '1',
      username: 'guardia_001',
      nombreCompleto: 'Juan Perez',
      rol: 'OPERADOR' as const,
      activo: true,
    };

    localStorage.setItem('usuario', JSON.stringify(mockUsuario));
    localStorage.setItem('accessToken', 'mock-token');

    const { result } = renderWithProviders();

    await waitFor(() => {
      expect(result.current.usuario).toEqual(mockUsuario);
    });
    expect(result.current.accessToken).toBe('mock-token');
  });

  it('login debería guardar usuario/token y devolver el usuario', async () => {
    const mockResponse = {
      data: {
        accessToken: 'new-token',
        refreshToken: 'new-refresh',
        usuario: {
          id: '2',
          username: 'supervisor_001',
          nombreCompleto: 'Maria Garcia',
          rol: 'SUPERVISOR',
          activo: true,
        },
      },
    };
    (axiosInstance.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockResponse);

    const { result } = renderWithProviders();

    let usuarioDevuelto;
    await act(async () => {
      usuarioDevuelto = await result.current.login('supervisor_001', 'Password123!');
    });

    expect(usuarioDevuelto).toEqual(mockResponse.data.usuario);
    expect(result.current.usuario).toEqual(mockResponse.data.usuario);
    expect(result.current.accessToken).toBe('new-token');
    expect(localStorage.getItem('accessToken')).toBe('new-token');
  });

  it('login debería propagar el error si las credenciales son inválidas', async () => {
    const error = { response: { status: 401, data: { message: 'Credenciales inválidas' } } };
    (axiosInstance.post as ReturnType<typeof vi.fn>).mockRejectedValueOnce(error);

    const { result } = renderWithProviders();

    await expect(
      act(async () => {
        await result.current.login('bad_user', 'bad_pass');
      })
    ).rejects.toEqual(error);
  });

  it('logout debería limpiar usuario, token y localStorage', async () => {
    localStorage.setItem('usuario', JSON.stringify({ id: '1', rol: 'OPERADOR' }));
    localStorage.setItem('accessToken', 'token-a-borrar');
    (axiosInstance.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce({});

    const { result } = renderWithProviders();

    await waitFor(() => expect(result.current.accessToken).toBe('token-a-borrar'));

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.usuario).toBeNull();
    expect(result.current.accessToken).toBeNull();
    expect(localStorage.getItem('accessToken')).toBeNull();
  });
});
