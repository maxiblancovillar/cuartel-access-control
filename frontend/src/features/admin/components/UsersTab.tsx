import React, { useState } from 'react';
import {
  useUsuarios,
  useCreateUsuario,
  useUpdateUsuario,
  useDeactivateUsuario,
} from '@/api/hooks/useAdmin';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';

const ROLES = [
  { value: 'OPERADOR', label: 'Operador' },
  { value: 'SUPERVISOR', label: 'Supervisor' },
  { value: 'ADMIN', label: 'Administrador' },
];

interface FormState {
  username: string;
  nombreCompleto: string;
  password: string;
  rol: 'OPERADOR' | 'SUPERVISOR' | 'ADMIN';
}

const FORM_INICIAL: FormState = {
  username: '',
  nombreCompleto: '',
  password: '',
  rol: 'OPERADOR',
};

export const UsersTab: React.FC = () => {
  const { data: usuarios, isLoading, refetch } = useUsuarios();
  const createUsuario = useCreateUsuario();
  const updateUsuario = useUpdateUsuario();
  const deactivateUsuario = useDeactivateUsuario();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormState>(FORM_INICIAL);

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(FORM_INICIAL);
  };

  // Extrae el mensaje de error más específico posible: los errores de
  // validación (ValidationException/ZodError, ambos serializados por el
  // backend como { message, details: { campo: [mensajes] } }) solo
  // mostraban el mensaje genérico "Errores de validación en los datos
  // enviados" sin decir qué campo falló (p. ej. "usuario ya en uso").
  const extraerMensajeError = (error: any, fallback: string): string => {
    const details = error.response?.data?.details;
    if (details && typeof details === 'object') {
      const mensajes = Object.values(details).flat().filter(Boolean);
      if (mensajes.length > 0) return mensajes.join(', ');
    }
    return error.response?.data?.message || fallback;
  };

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await updateUsuario.mutateAsync({
          id: editingId,
          data: { nombreCompleto: formData.nombreCompleto, rol: formData.rol },
        });
      } else {
        await createUsuario.mutateAsync(formData);
      }
      resetForm();
      refetch();
    } catch (error: any) {
      alert('Error: ' + extraerMensajeError(error, 'No se pudo guardar el usuario'));
    }
  };

  const handleDeactivate = async (id: string, username: string) => {
    if (confirm(`¿Confirmar desactivar al usuario "${username}"? No podrá volver a iniciar sesión.`)) {
      try {
        await deactivateUsuario.mutateAsync(id);
        refetch();
      } catch (error: any) {
        alert('Error: ' + extraerMensajeError(error, 'No se pudo desactivar el usuario'));
      }
    }
  };

  const handleReactivate = async (id: string, username: string) => {
    if (confirm(`¿Confirmar reactivar al usuario "${username}"? Podrá volver a iniciar sesión.`)) {
      try {
        await updateUsuario.mutateAsync({ id, data: { activo: true } });
        refetch();
      } catch (error: any) {
        alert('Error: ' + extraerMensajeError(error, 'No se pudo reactivar el usuario'));
      }
    }
  };

  if (isLoading) return <p>Cargando usuarios...</p>;

  return (
    <div className="space-y-6">
      <div>
        <Button
          onClick={() => (showForm ? resetForm() : setShowForm(true))}
          variant={showForm ? 'secondary' : 'primary'}
        >
          {showForm ? '✖️ Cancelar' : '➕ Nuevo Usuario'}
        </Button>
      </div>

      {showForm && (
        <Card title={editingId ? 'Editar Usuario' : 'Nuevo Usuario'}>
          <div className="space-y-4">
            <Input
              label="Usuario"
              value={formData.username}
              disabled={!!editingId}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
            <Input
              label="Nombre Completo"
              value={formData.nombreCompleto}
              onChange={(e) => setFormData({ ...formData, nombreCompleto: e.target.value })}
            />
            {!editingId && (
              <Input
                label="Contraseña"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            )}
            <Select
              label="Rol"
              options={ROLES}
              value={formData.rol}
              onChange={(e) => setFormData({ ...formData, rol: e.target.value as FormState['rol'] })}
            />
            <div className="flex gap-2">
              <Button onClick={handleSubmit} variant="primary">
                {editingId ? '💾 Actualizar' : '➕ Crear'}
              </Button>
              <Button onClick={resetForm} variant="secondary">
                Cancelar
              </Button>
            </div>
          </div>
        </Card>
      )}

      <Card title={`Usuarios (${usuarios?.length || 0})`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Usuario</th>
                <th className="px-4 py-2 text-left">Nombre</th>
                <th className="px-4 py-2 text-left">Rol</th>
                <th className="px-4 py-2 text-left">Estado</th>
                <th className="px-4 py-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {usuarios?.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-mono">{u.username}</td>
                  <td className="px-4 py-2">{u.nombreCompleto}</td>
                  <td className="px-4 py-2">
                    <Badge variant={u.rol === 'ADMIN' ? 'danger' : 'info'}>{u.rol}</Badge>
                  </td>
                  <td className="px-4 py-2">
                    <Badge variant={u.activo ? 'success' : 'warning'}>
                      {u.activo ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </td>
                  <td className="px-4 py-2 space-x-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        setEditingId(u.id);
                        setFormData({
                          username: u.username,
                          nombreCompleto: u.nombreCompleto,
                          password: '',
                          rol: u.rol,
                        });
                        setShowForm(true);
                      }}
                    >
                      ✏️ Editar
                    </Button>
                    {u.activo ? (
                      <Button size="sm" variant="danger" onClick={() => handleDeactivate(u.id, u.username)}>
                        🚫 Desactivar
                      </Button>
                    ) : (
                      <Button size="sm" variant="primary" onClick={() => handleReactivate(u.id, u.username)}>
                        ✅ Reactivar
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
