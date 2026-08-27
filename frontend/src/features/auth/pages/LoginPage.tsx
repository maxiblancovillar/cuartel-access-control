import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';

const loginSchema = z.object({
  username: z.string().min(3, 'Usuario mínimo 3 caracteres'),
  password: z.string().min(8, 'Contraseña mínimo 8 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const usuario = await login(data.username, data.password);
      // Redirigir según el rol: OPERADOR va a registrar accesos,
      // SUPERVISOR/ADMIN van al dashboard de monitoreo
      navigate(usuario.rol === 'OPERADOR' ? '/access' : '/dashboard');
    } catch (error: any) {
      setError('root', {
        message: error.response?.data?.message || 'Error en la autenticación',
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card title="🛡️ Sistema de Control de Acceso" className="w-full max-w-md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {errors.root && <Alert variant="danger">{errors.root.message}</Alert>}

          <Input
            label="Usuario"
            placeholder="guardia_001"
            {...register('username')}
            error={errors.username?.message}
          />

          <Input
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            {...register('password')}
            error={errors.password?.message}
          />

          <Button type="submit" isLoading={isSubmitting} className="w-full">
            Ingresar
          </Button>

          <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded">
            <p className="font-semibold mb-1">Credenciales de prueba:</p>
            <p>Usuario: guardia_001</p>
            <p>Contraseña: Password123!</p>
          </div>
        </form>
      </Card>
    </div>
  );
};
