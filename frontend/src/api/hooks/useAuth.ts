import { useMutation } from 'react-query';
import axiosInstance, { setAccessToken } from '../axiosConfig';
import { LoginResponse } from '@/types';

export const useLogin = () => {
  return useMutation(async (credentials: { username: string; password: string }) => {
    const { data } = await axiosInstance.post<LoginResponse>('/auth/login', credentials);
    setAccessToken(data.accessToken);
    // Guardar en localStorage (opcional)
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('usuario', JSON.stringify(data.usuario));
    return data;
  });
};

export const useLogout = () => {
  return useMutation(async () => {
    await axiosInstance.post('/auth/logout');
    setAccessToken(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('usuario');
  });
};
