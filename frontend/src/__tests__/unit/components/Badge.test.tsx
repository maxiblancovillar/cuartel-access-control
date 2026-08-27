import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '@/components/ui/Badge';

describe('Badge Component', () => {
  it('debería renderizar el texto hijo', () => {
    render(<Badge>Presente</Badge>);
    expect(screen.getByText('Presente')).toBeInTheDocument();
  });

  it('debería usar el variant info por defecto', () => {
    render(<Badge>Default</Badge>);
    expect(screen.getByText('Default')).toHaveClass('bg-blue-100');
  });

  it('debería aplicar la clase del variant danger', () => {
    render(<Badge variant="danger">Alerta</Badge>);
    expect(screen.getByText('Alerta')).toHaveClass('bg-red-100');
  });

  it('debería aplicar la clase del variant success', () => {
    render(<Badge variant="success">Activo</Badge>);
    expect(screen.getByText('Activo')).toHaveClass('bg-green-100');
  });
});
