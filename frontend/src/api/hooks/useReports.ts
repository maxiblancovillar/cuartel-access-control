import { useQuery } from 'react-query';
import axiosInstance from '../axiosConfig';

export interface RegistroReporte {
  id: string;
  fechaIngreso: string;
  horaIngreso?: string | null;
  horaEgreso?: string | null;
  personaNombre: string;
  personaApellido: string;
  tipoPersona: string;
  unidadDestino: string;
  estado: string;
  vehiculo?: string | null;
}

export interface ReportesResponse {
  registros: RegistroReporte[];
  total: number;
  abiertos: number;
  cerrados: number;
  promedioPermanencia: number;
}

export interface ReportStats {
  totalRegistros: number;
  registrosPorTipo: Record<string, number>;
  registrosPorHora: Record<string, number>;
  visitantesPorUnidad: Record<string, number>;
}

export interface FiltrosReporte {
  fechaInicio?: string;
  fechaFin?: string;
  tipoPersona?: string;
  unidadId?: number | undefined;
}

export const useReports = (filtros: FiltrosReporte) => {
  return useQuery(['reports', filtros], async () => {
    const { data } = await axiosInstance.get<ReportesResponse>('/reports/registros', {
      params: filtros,
    });
    return data;
  });
};

export const useReportStats = () => {
  return useQuery(['reports', 'stats'], async () => {
    const { data } = await axiosInstance.get<ReportStats>('/reports/stats');
    return data;
  });
};
