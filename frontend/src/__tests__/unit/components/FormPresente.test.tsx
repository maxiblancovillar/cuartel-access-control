import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const useLookupDniMock = vi.fn();
const useCheckInPresenteMock = vi.fn();
const useUnitsTreeMock = vi.fn();

vi.mock('@/api/hooks/useAccess', () => ({
  useLookupDni: () => useLookupDniMock(),
  useCheckInPresente: () => useCheckInPresenteMock(),
}));
vi.mock('@/api/hooks/useUnits', () => ({
  useUnitsTree: () => useUnitsTreeMock(),
}));

// alert() no existe en jsdom por defecto
vi.stubGlobal('alert', vi.fn());

import { FormPresente } from '@/features/access/components/FormPresente';

const personaMilitarPropio = {
  id: 'p1',
  dni: '38123456',
  nombre: 'Carlos',
  apellido: 'Gonzalez',
  tipoPersona: 'MILITAR_PROPIO',
  militar: {
    grado: 'Teniente',
    situacion: 'ACTIVO',
    unidadRevista: { id: 2, codigo: 'BIN601', nombre: 'Batallón 601', esUnidadPropia: true },
  },
};

const unidadesMock = [{ id: 2, codigo: 'BIN601', nombre: 'Batallón 601', esUnidadPropia: true }];

describe('FormPresente', () => {
  const mutateAsyncMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useUnitsTreeMock.mockReturnValue({ data: unidadesMock });
    useCheckInPresenteMock.mockReturnValue({ mutateAsync: mutateAsyncMock });
  });

  it('debería mostrar "Cargando..." mientras se busca la persona', () => {
    useLookupDniMock.mockReturnValue({ data: undefined, isLoading: true });
    render(<FormPresente dni="38123456" />);
    expect(screen.getByText('Cargando...')).toBeInTheDocument();
  });

  it('debería mostrar error si el DNI no se encuentra', () => {
    useLookupDniMock.mockReturnValue({ data: null, isLoading: false });
    render(<FormPresente dni="99999999" />);
    expect(screen.getByText(/DNI no encontrado/i)).toBeInTheDocument();
  });

  it('debería mostrar error si la persona no es personal propio', () => {
    useLookupDniMock.mockReturnValue({
      data: { ...personaMilitarPropio, tipoPersona: 'CIVIL', militar: undefined },
      isLoading: false,
    });
    render(<FormPresente dni="42987654" />);
    expect(screen.getByText(/no corresponde a personal propio/i)).toBeInTheDocument();
  });

  it('debería mostrar los datos de la persona y el formulario si es personal propio', () => {
    useLookupDniMock.mockReturnValue({ data: personaMilitarPropio, isLoading: false });
    render(<FormPresente dni="38123456" />);

    expect(screen.getByText('Carlos Gonzalez')).toBeInTheDocument();
    expect(screen.getByText(/Teniente/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Registrar Presente/i })).toBeInTheDocument();
  });

  it('debería enviar el formulario con la unidad seleccionada', async () => {
    useLookupDniMock.mockReturnValue({ data: personaMilitarPropio, isLoading: false });
    mutateAsyncMock.mockResolvedValueOnce({ id: 'ingreso-1', estado: 'ABIERTO' });
    render(<FormPresente dni="38123456" />);

    await userEvent.selectOptions(screen.getByRole('combobox'), '2');
    await userEvent.click(screen.getByRole('button', { name: /Registrar Presente/i }));

    await waitFor(() => {
      expect(mutateAsyncMock).toHaveBeenCalledWith(
        expect.objectContaining({ dni: '38123456', unidadDestinoId: 2 })
      );
    });
  });

  it('debería mostrar un error si falla el registro', async () => {
    useLookupDniMock.mockReturnValue({ data: personaMilitarPropio, isLoading: false });
    mutateAsyncMock.mockRejectedValueOnce({
      response: { data: { message: 'DNI 38123456 ya posee ingreso abierto' } },
    });
    render(<FormPresente dni="38123456" />);

    await userEvent.selectOptions(screen.getByRole('combobox'), '2');
    await userEvent.click(screen.getByRole('button', { name: /Registrar Presente/i }));

    await waitFor(() => {
      expect(screen.getByText('DNI 38123456 ya posee ingreso abierto')).toBeInTheDocument();
    });
  });
});
