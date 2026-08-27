import React from 'react';
import { RegistroReporte } from '@/api/hooks/useReports';
import { Badge } from '@/components/ui/Badge';

interface ReportTableProps {
  registros: RegistroReporte[];
}

export const ReportTable: React.FC<ReportTableProps> = ({ registros }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left">Nombre</th>
            <th className="px-4 py-2 text-left">Tipo</th>
            <th className="px-4 py-2 text-left">Unidad</th>
            <th className="px-4 py-2 text-left">Ingreso</th>
            <th className="px-4 py-2 text-left">Egreso</th>
            <th className="px-4 py-2 text-left">Vehículo</th>
            <th className="px-4 py-2 text-left">Estado</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {registros.map((r) => (
            <tr key={r.id} className="hover:bg-gray-50">
              <td className="px-4 py-2">
                {r.personaNombre} {r.personaApellido}
              </td>
              <td className="px-4 py-2">
                <Badge variant={r.tipoPersona === 'CIVIL' ? 'info' : 'success'}>
                  {r.tipoPersona}
                </Badge>
              </td>
              <td className="px-4 py-2">{r.unidadDestino}</td>
              <td className="px-4 py-2">{r.horaIngreso || '-'}</td>
              <td className="px-4 py-2">{r.horaEgreso || '-'}</td>
              <td className="px-4 py-2">{r.vehiculo || '-'}</td>
              <td className="px-4 py-2">
                <Badge variant={r.estado === 'CERRADO' ? 'success' : 'warning'}>{r.estado}</Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {registros.length === 0 && <p className="text-center py-4 text-gray-600">No hay registros</p>}
    </div>
  );
};
