import { useMutation, useQuery } from 'react-query';
import axiosInstance from '../axiosConfig';
import { Persona, RegistroIngreso } from '@/types';

export const useLookupDni = (dni: string) => {
  return useQuery(
    ['lookup', dni],
    async () => {
      const { data } = await axiosInstance.get<Persona>(`/access/lookup/${dni}`);
      return data;
    },
    {
      enabled: !!dni && dni.length >= 7,
      retry: false,
    }
  );
};

export const useCheckInPresente = () => {
  return useMutation(
    async (payload: {
      dni: string;
      unidadDestinoId: number;
      sectorId?: number | null | undefined;
      vehiculoId?: string | null | undefined;
      observaciones?: string | undefined;
    }) => {
      const { data } = await axiosInstance.post<RegistroIngreso>(
        '/access/check-in/presente',
        payload
      );
      return data;
    }
  );
};

export const useCheckInVisita = () => {
  return useMutation(
    async (payload: {
      dni: string;
      nombre: string;
      apellido: string;
      tipoPersona: 'MILITAR_EXTERNO' | 'CIVIL';
      unidadDestinoId: number;
      sectorId?: number | null | undefined;
      dominio?: string | null | undefined;
      tipoVehiculo?: string | undefined;
      marca?: string | undefined;
      modelo?: string | undefined;
      color?: string | undefined;
      detalleVisita?:
        | {
            procedencia: string;
            personaVisitada: string;
            motivoVisita: string;
          }
        | undefined;
      observaciones?: string | undefined;
    }) => {
      const { data } = await axiosInstance.post<RegistroIngreso>(
        '/access/check-in/visita',
        payload
      );
      return data;
    }
  );
};

export const useCheckOut = () => {
  return useMutation(async (payload: { ingresoId: string; observaciones?: string | undefined }) => {
    const { data } = await axiosInstance.patch<RegistroIngreso>(
      `/access/check-out/${payload.ingresoId}`,
      { observaciones: payload.observaciones }
    );
    return data;
  });
};
