import React from 'react';
import { ProtectedLayout } from '@/components/layout/ProtectedLayout';
import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';

export const AdminPage: React.FC = () => {
  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">⚙️ Administración</h1>

        <Alert variant="info" title="🚧 En construcción">
          El panel de administración todavía no está implementado. Vas a poder gestionar
          usuarios, unidades y auditoría desde acá próximamente.
        </Alert>

        <Card title="Próximamente">
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li>Gestión de usuarios y roles</li>
            <li>Árbol organizacional (unidades y sectores)</li>
            <li>Logs de auditoría</li>
          </ul>
        </Card>
      </div>
    </ProtectedLayout>
  );
};
