import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card } from '@/components/ui/Card';

describe('Card Component', () => {
  it('debería renderizar el contenido hijo', () => {
    render(
      <Card>
        <p>Card content</p>
      </Card>
    );

    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('debería renderizar el título cuando se proporciona', () => {
    render(<Card title="Test Title">Contenido</Card>);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('no debería renderizar un heading si no se pasa título', () => {
    render(<Card>Contenido sin título</Card>);
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('debería renderizar el subtítulo solo si hay título y subtítulo', () => {
    render(
      <Card title="Title" subtitle="Subtitle">
        Content
      </Card>
    );

    expect(screen.getByText('Subtitle')).toBeInTheDocument();
  });

  it('debería aplicar una clase personalizada además de las propias', () => {
    const { container } = render(<Card className="custom-class">Content</Card>);
    expect(container.firstChild).toHaveClass('custom-class');
    expect(container.firstChild).toHaveClass('bg-white');
  });
});
