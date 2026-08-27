import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';

vi.mock('@/api/axiosConfig', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

import axiosInstance from '@/api/axiosConfig';
import {
  useLookupDni,
  useCheckInPresente,
  useCheckInVisita,
  useCheckOut,
} from '@/api/hooks/useAccess';

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe('useAccess hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useLookupDni', () => {
    it('debería hacer GET a /access/lookup/:dni cuando el DNI tiene 7+ caracteres', async () => {
      (axiosInstance.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        data: { dni: '38123456', nombre: 'Carlos' },
      });

      const { result } = renderHook(() => useLookupDni('38123456'), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(axiosInstance.get).toHaveBeenCalledWith('/access/lookup/38123456');
      expect(result.current.data).toEqual({ dni: '38123456', nombre: 'Carlos' });
    });

    it('no debería hacer la petición si el DNI tiene menos de 7 caracteres', () => {
      renderHook(() => useLookupDni('123'), { wrapper });
      expect(axiosInstance.get).not.toHaveBeenCalled();
    });
  });

  describe('useCheckInPresente', () => {
    it('debería hacer POST a /access/check-in/presente', async () => {
      (axiosInstance.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        data: { id: 'ingreso-1', estado: 'ABIERTO' },
      });

      const { result } = renderHook(() => useCheckInPresente(), { wrapper });
      const respuesta = await result.current.mutateAsync({ dni: '38123456', unidadDestinoId: 2 });

      expect(axiosInstance.post).toHaveBeenCalledWith('/access/check-in/presente', {
        dni: '38123456',
        unidadDestinoId: 2,
      });
      expect(respuesta.estado).toBe('ABIERTO');
    });
  });

  describe('useCheckInVisita', () => {
    it('debería hacer POST a /access/check-in/visita', async () => {
      (axiosInstance.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        data: { id: 'ingreso-2', fichaNro: 1 },
      });

      const { result } = renderHook(() => useCheckInVisita(), { wrapper });
      const payload = {
        dni: '42987654',
        nombre: 'Ana',
        apellido: 'Martinez',
        tipoPersona: 'CIVIL' as const,
        unidadDestinoId: 2,
      };
      const respuesta = await result.current.mutateAsync(payload);

      expect(axiosInstance.post).toHaveBeenCalledWith('/access/check-in/visita', payload);
      expect(respuesta.fichaNro).toBe(1);
    });
  });

  describe('useCheckOut', () => {
    it('debería hacer PATCH a /access/check-out/:ingresoId', async () => {
      (axiosInstance.patch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        data: { id: 'ingreso-1', estado: 'CERRADO' },
      });

      const { result } = renderHook(() => useCheckOut(), { wrapper });
      const respuesta = await result.current.mutateAsync({ ingresoId: 'ingreso-1' });

      expect(axiosInstance.patch).toHaveBeenCalledWith('/access/check-out/ingreso-1', {
        observaciones: undefined,
      });
      expect(respuesta.estado).toBe('CERRADO');
    });
  });
});
