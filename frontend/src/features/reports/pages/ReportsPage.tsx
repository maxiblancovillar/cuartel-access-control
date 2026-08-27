import React, { useState } from 'react';
import { ProtectedLayout } from '@/components/layout/ProtectedLayout';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { useReports, useReportStats, FiltrosReporte } from '@/api/hooks/useReports';
import { useUnitsTree } from '@/api/hooks/useUnits';
import { ReportCharts } from '../components/ReportCharts';
import { ReportTable } from '../components/ReportTable';

export const ReportsPage: React.FC = () => {
  const [filtros, setFiltros] = useState<FiltrosReporte>({
    fechaInicio: '',
    fechaFin: '',
    tipoPersona: '',
    unidadId: undefined,
  });

  const { data: reports, isLoading: loadingReports, error: reportsError } = useReports(filtros);
  const { data: stats, isLoading: loadingStats } = useReportStats();
  const { data: unidades } = useUnitsTree();

  const handleFilterChange = (key: keyof FiltrosReporte, value: string | number | undefined) => {
    setFiltros((prev) => ({ ...prev, [key]: value }));
  };

  const handleExportCSV = () => {
    if (!reports?.registros || reports.registros.length === 0) return;

    const headers = ['Nombre', 'Tipo', 'Unidad', 'Ingreso', 'Egreso', 'Vehículo', 'Estado'];
    const rows = reports.registros.map((r) => [
      `${r.personaNombre} ${r.personaApellido}`,
      r.tipoPersona,
      r.unidadDestino,
      r.horaIngreso || '-',
      r.horaEgreso || '-',
      r.vehiculo || '-',
      r.estado,
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reportes-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const unidadesOptions = unidades?.map((u) => ({ value: u.id, label: u.nombre })) || [];

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">📄 Reportes</h1>

        {/* FILTROS */}
        <Card title="Filtros">
          <div className="grid grid-cols-4 gap-4">
            <Input
              type="date"
              label="Fecha Inicio"
              value={filtros.fechaInicio}
              onChange={(e) => handleFilterChange('fechaInicio', e.target.value)}
            />
            <Input
              type="date"
              label="Fecha Fin"
              value={filtros.fechaFin}
              onChange={(e) => handleFilterChange('fechaFin', e.target.value)}
            />
            <Select
              label="Tipo Persona"
              options={[
                { value: '', label: 'Todos' },
                { value: 'MILITAR_PROPIO', label: 'Militar Propio' },
                { value: 'MILITAR_EXTERNO', label: 'Militar Externo' },
                { value: 'CIVIL', label: 'Civil' },
              ]}
              value={filtros.tipoPersona}
              onChange={(e) => handleFilterChange('tipoPersona', e.target.value)}
            />
            <Select
              label="Unidad"
              options={unidadesOptions}
              value={filtros.unidadId ?? ''}
              onChange={(e) =>
                handleFilterChange('unidadId', e.target.value ? parseInt(e.target.value, 10) : undefined)
              }
            />
          </div>
        </Card>

        {/* GRÁFICOS */}
        {loadingStats ? <p>Cargando gráficos...</p> : stats && <ReportCharts stats={stats} />}

        {/* TABLA DE REGISTROS */}
        <Card title={`Registros (Total: ${reports?.total ?? 0})`}>
          {reports && (
            <div className="grid grid-cols-3 gap-4 mb-4 text-center">
              <div className="bg-yellow-50 rounded-lg p-3">
                <p className="text-2xl font-bold text-yellow-700">{reports.abiertos}</p>
                <p className="text-sm text-gray-600">Abiertos</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-2xl font-bold text-green-700">{reports.cerrados}</p>
                <p className="text-sm text-gray-600">Cerrados</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-2xl font-bold text-blue-700">{reports.promedioPermanencia}</p>
                <p className="text-sm text-gray-600">Permanencia promedio (min)</p>
              </div>
            </div>
          )}

          <div className="mb-4 flex gap-2">
            <Button onClick={handleExportCSV} variant="secondary" disabled={!reports?.registros.length}>
              📥 Descargar CSV
            </Button>
          </div>

          {Boolean(reportsError) && <Alert variant="danger">Error al cargar los registros</Alert>}

          {loadingReports ? (
            <p>Cargando registros...</p>
          ) : (
            <ReportTable registros={reports?.registros || []} />
          )}
        </Card>
      </div>
    </ProtectedLayout>
  );
};
