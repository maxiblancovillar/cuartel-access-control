import React from 'react';
import { ProtectedLayout } from '@/components/layout/ProtectedLayout';
import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';

export const ReportsPage: React.FC = () => {
  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">📄 Reportes</h1>

        <Alert variant="info" title="🚧 En construcción">
          El módulo de reportes (Libro de Guardia y estadísticas) todavía no está implementado.
          Vas a poder generar y descargar reportes desde acá próximamente.
        </Alert>

        <Card title="Próximamente">
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li>Libro de Guardia (PDF diario con firmas)</li>
            <li>Historial de ingresos y egresos por rango de fechas</li>
            <li>Estadísticas de personal propio y visitas</li>
          </ul>
        </Card>
      </div>
    </ProtectedLayout>
  );
};
