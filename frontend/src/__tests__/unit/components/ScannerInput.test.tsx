import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ScannerInput } from '@/features/access/components/ScannerInput';

describe('ScannerInput', () => {
  it('debería llamar onDniScanned al presionar Enter con un DNI válido', async () => {
    const onDniScanned = vi.fn();
    render(<ScannerInput onDniScanned={onDniScanned} />);

    const input = screen.getByPlaceholderText(/DNI/i);
    await userEvent.type(input, '38123456{Enter}');

    expect(onDniScanned).toHaveBeenCalledWith('38123456');
  });

  it('no debería llamar onDniScanned si el DNI tiene menos de 7 dígitos', async () => {
    const onDniScanned = vi.fn();
    render(<ScannerInput onDniScanned={onDniScanned} />);

    const input = screen.getByPlaceholderText(/DNI/i);
    await userEvent.type(input, '123{Enter}');

    expect(onDniScanned).not.toHaveBeenCalled();
  });

  it('debería llamar onDniScanned al hacer click en Buscar', async () => {
    const onDniScanned = vi.fn();
    render(<ScannerInput onDniScanned={onDniScanned} />);

    const input = screen.getByPlaceholderText(/DNI/i);
    await userEvent.type(input, '42987654');
    await userEvent.click(screen.getByRole('button', { name: /buscar/i }));

    expect(onDniScanned).toHaveBeenCalledWith('42987654');
  });

  it('debería limpiar el input después de escanear', async () => {
    const onDniScanned = vi.fn();
    render(<ScannerInput onDniScanned={onDniScanned} />);

    const input = screen.getByPlaceholderText(/DNI/i) as HTMLInputElement;
    await userEvent.type(input, '38123456{Enter}');

    expect(input.value).toBe('');
  });
});
