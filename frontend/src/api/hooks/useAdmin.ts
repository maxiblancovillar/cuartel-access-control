import { useMutation, useQuery } from 'react-query';
import axiosInstance from '../axiosConfig';
import { Unidad } from '@/types';

export interface Usuario {
  id: string;
  username: string;
  nombreCompleto: string;
  rol: 'OPERADOR' | 'SUPERVISOR' | 'ADMIN';
  activo: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  usuarioId: string | null;
  usuarioUsername: string;
  accion: string;
  recurso: string;
  exitoso: boolean;
  detalle: string | null;
  timestamp: string;
}

// Usuarios
export const useUsuarios = () => {
  return useQuery(['admin', 'usuarios'], async () => {
    const { data } = await axiosInstance.get<Usuario[]>('/admin/usuarios');
    return data;
  });
};

export const useCreateUsuario = () => {
  return useMutation(
    async (payload: {
      username: string;
      nombreCompleto: string;
      password: string;
      rol: 'OPERADOR' | 'SUPERVISOR' | 'ADMIN';
    }) => {
      const { data } = await axiosInstance.post<Usuario>('/admin/usuarios', payload);
      return data;
    }
  );
};

export const useUpdateUsuario = () => {
  return useMutation(
    async (payload: {
      id: string;
      data: {
        nombreCompleto?: string;
        rol?: 'OPERADOR' | 'SUPERVISOR' | 'ADMIN';
        activo?: boolean;
        password?: string;
      };
    }) => {
      const { data } = await axiosInstance.put<Usuario>(
        `/admin/usuarios/${payload.id}`,
        payload.data
      );
      return data;
    }
  );
};

export const useDeactivateUsuario = () => {
  return useMutation(async (id: string) => {
    await axiosInstance.delete(`/admin/usuarios/${id}`);
  });
};

// Unidades
export const useUnidadesAdmin = () => {
  return useQuery(['admin', 'unidades'], async () => {
    const { data } = await axiosInstance.get<Unidad[]>('/admin/unidades');
    return data;
  });
};

export const useCreateUnidad = () => {
  return useMutation(
    async (payload: {
      codigo: string;
      nombre: string;
      tipoNivel: 'COMANDO_DIRECCION' | 'UNIDAD_ORGANISMO' | 'SEDE_EXTERNA';
      esUnidadPropia?: boolean;
      unidadPadreId?: number | null;
    }) => {
      const { data } = await axiosInstance.post<Unidad>('/admin/unidades', payload);
      return data;
    }
  );
};

export const useUpdateUnidad = () => {
  return useMutation(
    async (payload: {
      id: number;
      data: {
        nombre?: string;
        tipoNivel?: 'COMANDO_DIRECCION' | 'UNIDAD_ORGANISMO' | 'SEDE_EXTERNA';
        esUnidadPropia?: boolean;
        activo?: boolean;
        unidadPadreId?: number | null;
      };
    }) => {
      const { data } = await axiosInstance.put<Unidad>(
        `/admin/unidades/${payload.id}`,
        payload.data
      );
      return data;
    }
  );
};

// Logs
export const useAuditLogs = () => {
  return useQuery(['admin', 'logs'], async () => {
    const { data } = await axiosInstance.get<AuditLog[]>('/admin/audit-logs?limit=50');
    return data;
  });
};
