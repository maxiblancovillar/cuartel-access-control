import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthContextType, LoginResponse } from '@/types';
import { useLogin as useLoginMutation, useLogout as useLogoutMutation } from '@/api/hooks/useAuth';
import { setAccessToken } from '@/api/axiosConfig';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<LoginResponse['usuario'] | null>(null);
  const [accessToken, setToken] = useState<string | null>(null);
  // La rehidratación desde localStorage ocurre en un useEffect (después del
  // primer render). Sin este flag, ProtectedRoute vería accessToken=null
  // en ese primer render y redirigiría a /login incluso con una sesión
  // válida guardada (p. ej. al recargar la página en /admin o /reports).
  const [isInitializing, setIsInitializing] = useState(true);
  const loginMutation = useLoginMutation();
  const logoutMutation = useLogoutMutation();

  // Cargar token desde localStorage al iniciar
  useEffect(() => {
    const savedToken = localStorage.getItem('accessToken');
    const savedUsuario = localStorage.getItem('usuario');
    if (savedToken && savedUsuario) {
      setToken(savedToken);
      setUsuario(JSON.parse(savedUsuario));
      setAccessToken(savedToken);
    }
    setIsInitializing(false);
  }, []);

  const login = async (username: string, password: string) => {
    const response = await loginMutation.mutateAsync({ username, password });
    setToken(response.accessToken);
    setUsuario(response.usuario);
    return response.usuario;
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
    setToken(null);
    setUsuario(null);
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        accessToken,
        isLoading: loginMutation.isLoading || logoutMutation.isLoading,
        isInitializing,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
