import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '@/components/ui/Input';

describe('Input Component', () => {
  it('debería renderizar el label cuando se proporciona', () => {
    render(<Input label="Usuario" />);
    expect(screen.getByText('Usuario')).toBeInTheDocument();
  });

  it('debería mostrar el mensaje de error', () => {
    render(<Input label="DNI" error="DNI inválido" />);
    expect(screen.getByText('DNI inválido')).toBeInTheDocument();
  });

  it('debería permitir escribir texto', async () => {
    render(<Input placeholder="Escribe aquí" />);
    const input = screen.getByPlaceholderText('Escribe aquí');

    await userEvent.type(input, '38123456');

    expect(input).toHaveValue('38123456');
  });

  it('debería llamar onChange al escribir', async () => {
    const onChange = vi.fn();
    render(<Input onChange={onChange} />);

    await userEvent.type(screen.getByRole('textbox'), 'a');

    expect(onChange).toHaveBeenCalled();
  });
});
