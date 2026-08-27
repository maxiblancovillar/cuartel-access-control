import { useQuery } from 'react-query';
import axiosInstance from '../axiosConfig';
import { Unidad } from '@/types';

export const useUnitsTree = () => {
  return useQuery(['units', 'tree'], async () => {
    const { data } = await axiosInstance.get<{ unidades: Unidad[] }>('/units/tree');
    return data.unidades;
  });
};
