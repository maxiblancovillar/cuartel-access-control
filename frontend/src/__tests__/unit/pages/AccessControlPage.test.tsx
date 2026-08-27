import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ usuario: { nombreCompleto: 'Juan Perez', rol: 'OPERADOR' }, logout: vi.fn() }),
}));

vi.mock('@/features/access/components/FormPresente', () => ({
  FormPresente: ({ dni }: { dni: string }) => <div>Form Presente para {dni}</div>,
}));
vi.mock('@/features/access/components/FormVisita', () => ({
  FormVisita: ({ dni }: { dni: string }) => <div>Form Visita para {dni}</div>,
}));

import { AccessControlPage } from '@/features/access/pages/AccessControlPage';

function renderPage() {
  return render(
    <MemoryRouter>
      <AccessControlPage />
    </MemoryRouter>
  );
}

describe('AccessControlPage', () => {
  it('no debería mostrar los tabs ni formularios hasta que se escanee un DNI', () => {
    renderPage();

    expect(screen.queryByText(/Dar Presente/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Form Presente/i)).not.toBeInTheDocument();
  });

  it('debería mostrar el tab "presente" por defecto tras escanear un DNI', async () => {
    renderPage();

    const input = screen.getByPlaceholderText(/DNI/i);
    await userEvent.type(input, '38123456{Enter}');

    expect(screen.getByText(/DNI:/)).toBeInTheDocument();
    expect(screen.getByText('38123456')).toBeInTheDocument();
    expect(screen.getByText('Form Presente para 38123456')).toBeInTheDocument();
  });

  it('debería cambiar al tab "visita" al hacer click', async () => {
    renderPage();

    await userEvent.type(screen.getByPlaceholderText(/DNI/i), '42987654{Enter}');
    await userEvent.click(screen.getByRole('button', { name: /Registrar Visita/i }));

    expect(screen.getByText('Form Visita para 42987654')).toBeInTheDocument();
    expect(screen.queryByText(/Form Presente/i)).not.toBeInTheDocument();
  });
});
