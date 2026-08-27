import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';

vi.mock('@/api/axiosConfig', () => ({
  default: {
    get: vi.fn(),
  },
}));

import axiosInstance from '@/api/axiosConfig';
import { useSituacionActual } from '@/api/hooks/useDashboard';
import { useUnitsTree } from '@/api/hooks/useUnits';

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe('useSituacionActual', () => {
  beforeEach(() => vi.clearAllMocks());

  it('debería hacer GET a /dashboard/situacion-actual', async () => {
    (axiosInstance.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { kpis: { totalPersonasActuales: 0 }, presentes: [], alertas: [] },
    });

    const { result } = renderHook(() => useSituacionActual(30000), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(axiosInstance.get).toHaveBeenCalledWith('/dashboard/situacion-actual');
    expect(result.current.data?.kpis.totalPersonasActuales).toBe(0);
  });
});

describe('useUnitsTree', () => {
  beforeEach(() => vi.clearAllMocks());

  it('debería hacer GET a /units/tree y devolver el array de unidades', async () => {
    (axiosInstance.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { unidades: [{ id: 1, codigo: 'BIN601', nombre: 'Batallón 601' }] },
    });

    const { result } = renderHook(() => useUnitsTree(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(axiosInstance.get).toHaveBeenCalledWith('/units/tree');
    expect(result.current.data).toEqual([{ id: 1, codigo: 'BIN601', nombre: 'Batallón 601' }]);
  });
});
