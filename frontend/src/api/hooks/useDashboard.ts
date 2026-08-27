import { useQuery } from 'react-query';
import axiosInstance from '../axiosConfig';
import { SituacionActual } from '@/types';

export const useSituacionActual = (pollingInterval: number = 30000) => {
  return useQuery(
    ['dashboard', 'situacion-actual'],
    async () => {
      const { data } = await axiosInstance.get<SituacionActual>('/dashboard/situacion-actual');
      return data;
    },
    {
      refetchInterval: pollingInterval,
      staleTime: 10000,
    }
  );
};
