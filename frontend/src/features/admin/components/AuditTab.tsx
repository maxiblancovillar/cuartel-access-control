import React from 'react';
import { useAuditLogs } from '@/api/hooks/useAdmin';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export const AuditTab: React.FC = () => {
  const { data: logs, isLoading } = useAuditLogs();

  if (isLoading) return <p>Cargando logs...</p>;

  return (
    <Card title="Log de Auditoría (últimos 50 eventos)">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Timestamp</th>
              <th className="px-4 py-2 text-left">Usuario</th>
              <th className="px-4 py-2 text-left">Acción</th>
              <th className="px-4 py-2 text-left">Recurso</th>
              <th className="px-4 py-2 text-left">Detalle</th>
              <th className="px-4 py-2 text-left">Resultado</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {logs?.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-xs whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString('es-AR')}
                </td>
                <td className="px-4 py-2 font-mono">{log.usuarioUsername}</td>
                <td className="px-4 py-2">
                  <Badge variant="info">{log.accion}</Badge>
                </td>
                <td className="px-4 py-2">{log.recurso}</td>
                <td className="px-4 py-2 text-gray-600">{log.detalle || '-'}</td>
                <td className="px-4 py-2">
                  <Badge variant={log.exitoso ? 'success' : 'danger'}>
                    {log.exitoso ? 'OK' : 'Error'}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs?.length === 0 && (
          <p className="text-center py-4 text-gray-600">No hay eventos registrados</p>
        )}
      </div>
    </Card>
  );
};
