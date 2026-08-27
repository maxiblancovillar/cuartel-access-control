import React from 'react';
import { ProtectedLayout } from '@/components/layout/ProtectedLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { useSituacionActual } from '@/api/hooks/useDashboard';

export const DashboardPage: React.FC = () => {
  const { data: situacion, isLoading, error } = useSituacionActual(30000);

  if (isLoading) return <p>Cargando dashboard...</p>;
  if (error) return <Alert variant="danger">Error al cargar dashboard</Alert>;
  if (!situacion) return null;

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">📊 Dashboard</h1>

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">
                {situacion.kpis.totalPersonasActuales}
              </p>
              <p className="text-sm text-gray-600">Personas Actuales</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{situacion.kpis.militaresPropio}</p>
              <p className="text-sm text-gray-600">Personal Propio</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-600">{situacion.kpis.visitantes}</p>
              <p className="text-sm text-gray-600">Visitantes</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">
                {situacion.kpis.vehiculosActuales}
              </p>
              <p className="text-sm text-gray-600">Vehículos</p>
            </div>
          </Card>
        </div>

        {/* Alertas de Permanencia */}
        {situacion.alertas.length > 0 && (
          <Alert variant="danger" title="⚠️ Alertas de Permanencia">
            <ul className="space-y-2">
              {situacion.alertas.map((alerta) => (
                <li key={alerta.id} className="text-sm">
                  • {alerta.mensaje}
                </li>
              ))}
            </ul>
          </Alert>
        )}

        {/* Presentes */}
        <Card title="Personas Presentes">
          {situacion.presentes.length === 0 ? (
            <p className="text-gray-600 text-center py-4">No hay personas presentes</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left">Nombre</th>
                    <th className="px-4 py-2 text-left">Grado</th>
                    <th className="px-4 py-2 text-left">Unidad</th>
                    <th className="px-4 py-2 text-left">Hora Ingreso</th>
                    <th className="px-4 py-2 text-left">Vehículo</th>
                    <th className="px-4 py-2 text-left">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {situacion.presentes.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2">
                        {p.persona.nombre} {p.persona.apellido}
                      </td>
                      <td className="px-4 py-2">{p.persona.grado || '-'}</td>
                      <td className="px-4 py-2">{p.unidad}</td>
                      <td className="px-4 py-2">{p.horaIngreso}</td>
                      <td className="px-4 py-2">{p.vehiculo || '-'}</td>
                      <td className="px-4 py-2">
                        {p.alerta ? (
                          <Badge variant="danger">⚠️ Alerta</Badge>
                        ) : (
                          <Badge variant="success">Presente</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Última actualización */}
        <p className="text-xs text-gray-500 text-center">
          Última actualización: {new Date(situacion.timestamp).toLocaleTimeString('es-AR')}
        </p>
      </div>
    </ProtectedLayout>
  );
};
