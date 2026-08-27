import axios, { AxiosInstance } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

let accessToken: string | null = null;

export const setAccessToken = (token: string | null): void => {
  accessToken = token;
};

export const getAccessToken = (): string | null => accessToken;

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.includes('/auth/login');

    // Un 401 en /auth/login son credenciales inválidas, no una sesión expirada:
    // se deja que LoginPage muestre el mensaje de error en el propio formulario
    // en vez de forzar una redirección/reload que lo pisaría.
    if (error.response?.status === 401 && !isLoginRequest) {
      setAccessToken(null);
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
