import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const useLookupDniMock = vi.fn();
const useCheckInVisitaMock = vi.fn();
const useUnitsTreeMock = vi.fn();

vi.mock('@/api/hooks/useAccess', () => ({
  useLookupDni: () => useLookupDniMock(),
  useCheckInVisita: () => useCheckInVisitaMock(),
}));
vi.mock('@/api/hooks/useUnits', () => ({
  useUnitsTree: () => useUnitsTreeMock(),
}));

vi.stubGlobal('alert', vi.fn());

import { FormVisita } from '@/features/access/components/FormVisita';

const unidadesMock = [{ id: 2, codigo: 'BIN601', nombre: 'Batallón 601', esUnidadPropia: true }];

describe('FormVisita', () => {
  const mutateAsyncMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useLookupDniMock.mockReturnValue({ data: undefined, isLoading: false });
    useUnitsTreeMock.mockReturnValue({ data: unidadesMock });
    useCheckInVisitaMock.mockReturnValue({ mutateAsync: mutateAsyncMock });
  });

  it('debería renderizar todos los campos del formulario de visita', () => {
    render(<FormVisita dni="42987654" />);

    expect(screen.getByPlaceholderText('Nombre del visitante')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Apellido del visitante')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('AAA123')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Registrar Visita/i })).toBeInTheDocument();
  });

  it('debería mostrar errores de validación con campos vacíos', async () => {
    render(<FormVisita dni="42987654" />);

    await userEvent.click(screen.getByRole('button', { name: /Registrar Visita/i }));

    await waitFor(() => {
      expect(screen.getByText(/Nombre mínimo 2 caracteres/i)).toBeInTheDocument();
      expect(screen.getByText(/Procedencia requerida/i)).toBeInTheDocument();
    });
    expect(mutateAsyncMock).not.toHaveBeenCalled();
  });

  it('debería enviar el formulario completo correctamente', async () => {
    mutateAsyncMock.mockResolvedValueOnce({ id: 'ingreso-2', estado: 'ABIERTO', fichaNro: 1 });
    render(<FormVisita dni="42987654" />);

    await userEvent.type(screen.getByPlaceholderText('Nombre del visitante'), 'Ana');
    await userEvent.type(screen.getByPlaceholderText('Apellido del visitante'), 'Martinez');
    await userEvent.selectOptions(screen.getAllByRole('combobox')[0], 'CIVIL');
    await userEvent.selectOptions(screen.getAllByRole('combobox')[1], '2');
    await userEvent.type(screen.getByPlaceholderText('Ciudad/Localidad'), 'Buenos Aires');
    await userEvent.type(screen.getByPlaceholderText('Nombre del contacto'), 'Juan Perez');
    await userEvent.type(
      screen.getByPlaceholderText('Descripción detallada del motivo'),
      'Reunion administrativa de rutina programada'
    );

    await userEvent.click(screen.getByRole('button', { name: /Registrar Visita/i }));

    await waitFor(() => {
      expect(mutateAsyncMock).toHaveBeenCalledWith(
        expect.objectContaining({
          dni: '42987654',
          nombre: 'Ana',
          apellido: 'Martinez',
          tipoPersona: 'CIVIL',
          unidadDestinoId: 2,
        })
      );
    });
  });

  it('debería mostrar un error si el backend rechaza la visita', async () => {
    mutateAsyncMock.mockRejectedValueOnce({
      response: { data: { message: 'Error al registrar visita' } },
    });
    render(<FormVisita dni="42987654" />);

    await userEvent.type(screen.getByPlaceholderText('Nombre del visitante'), 'Ana');
    await userEvent.type(screen.getByPlaceholderText('Apellido del visitante'), 'Martinez');
    await userEvent.selectOptions(screen.getAllByRole('combobox')[0], 'CIVIL');
    await userEvent.selectOptions(screen.getAllByRole('combobox')[1], '2');
    await userEvent.type(screen.getByPlaceholderText('Ciudad/Localidad'), 'Buenos Aires');
    await userEvent.type(screen.getByPlaceholderText('Nombre del contacto'), 'Juan Perez');
    await userEvent.type(
      screen.getByPlaceholderText('Descripción detallada del motivo'),
      'Reunion administrativa de rutina programada'
    );
    await userEvent.click(screen.getByRole('button', { name: /Registrar Visita/i }));

    await waitFor(() => {
      expect(screen.getByText('Error al registrar visita')).toBeInTheDocument();
    });
  });
});
