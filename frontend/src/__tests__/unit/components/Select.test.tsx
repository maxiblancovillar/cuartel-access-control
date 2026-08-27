import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Select } from '@/components/ui/Select';

const options = [
  { value: 1, label: 'Batallón de Infantería 601' },
  { value: 2, label: 'Sección Militar de Control' },
];

describe('Select Component', () => {
  it('debería renderizar el label y las opciones', () => {
    render(<Select label="Unidad Destino" options={options} />);

    expect(screen.getByText('Unidad Destino')).toBeInTheDocument();
    expect(screen.getByText('Batallón de Infantería 601')).toBeInTheDocument();
    expect(screen.getByText('Sección Militar de Control')).toBeInTheDocument();
  });

  it('debería incluir la opción "-- Seleccionar --" por defecto', () => {
    render(<Select options={options} />);
    expect(screen.getByText('-- Seleccionar --')).toBeInTheDocument();
  });

  it('debería mostrar el mensaje de error', () => {
    render(<Select options={options} error="Seleccionar unidad" />);
    expect(screen.getByText('Seleccionar unidad')).toBeInTheDocument();
  });

  it('debería permitir seleccionar una opción y disparar onChange', async () => {
    const onChange = vi.fn();
    render(<Select options={options} onChange={onChange} />);

    await userEvent.selectOptions(screen.getByRole('combobox'), '2');

    expect(onChange).toHaveBeenCalled();
    expect(screen.getByRole('combobox')).toHaveValue('2');
  });
});
