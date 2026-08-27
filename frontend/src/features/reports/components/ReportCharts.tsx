import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '@/components/ui/Card';
import { ReportStats } from '@/api/hooks/useReports';

interface ReportChartsProps {
  stats: ReportStats;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export const ReportCharts: React.FC<ReportChartsProps> = ({ stats }) => {
  const tiposData = Object.entries(stats.registrosPorTipo).map(([tipo, cantidad]) => ({
    name: tipo,
    value: cantidad,
  }));

  const horasData = Object.entries(stats.registrosPorHora)
    .sort(([horaA], [horaB]) => horaA.localeCompare(horaB))
    .map(([hora, cantidad]) => ({
      hora: `${hora}:00`,
      cantidad,
    }));

  const unidadesData = Object.entries(stats.visitantesPorUnidad)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([unidad, cantidad]) => ({
      unidad,
      cantidad,
    }));

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* PIE CHART - Registros por Tipo */}
      <Card title="Registros por Tipo">
        {tiposData.length === 0 ? (
          <p className="text-center py-12 text-gray-500">Sin datos</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={tiposData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {tiposData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* LINE CHART - Ingresos por Hora */}
      <Card title="Ingresos por Hora del Día">
        {horasData.length === 0 ? (
          <p className="text-center py-12 text-gray-500">Sin datos</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={horasData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hora" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="cantidad" stroke="#3b82f6" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* BAR CHART - Top Unidades */}
      <Card title="Visitantes por Unidad (Top 5)" className="col-span-2">
        {unidadesData.length === 0 ? (
          <p className="text-center py-12 text-gray-500">Sin datos</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={unidadesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="unidad" angle={-45} textAnchor="end" height={80} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="cantidad" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>
    </div>
  );
};
