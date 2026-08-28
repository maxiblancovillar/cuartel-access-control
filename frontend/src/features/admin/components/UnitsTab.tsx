import React, { useState } from 'react';
import { useUnidadesAdmin, useCreateUnidad, useUpdateUnidad } from '@/api/hooks/useAdmin';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Unidad } from '@/types';

const TIPOS_NIVEL = [
  { value: 'COMANDO_DIRECCION', label: 'Comando/Dirección' },
  { value: 'UNIDAD_ORGANISMO', label: 'Unidad/Organismo' },
  { value: 'SEDE_EXTERNA', label: 'Sede Externa' },
];

interface FormState {
  codigo: string;
  nombre: string;
  tipoNivel: 'COMANDO_DIRECCION' | 'UNIDAD_ORGANISMO' | 'SEDE_EXTERNA';
  esUnidadPropia: boolean;
}

const FORM_INICIAL: FormState = {
  codigo: '',
  nombre: '',
  tipoNivel: 'UNIDAD_ORGANISMO',
  esUnidadPropia: false,
};

export const UnitsTab: React.FC = () => {
  const { data: unidades, isLoading, refetch } = useUnidadesAdmin();
  const createUnidad = useCreateUnidad();
  const updateUnidad = useUpdateUnidad();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormState>(FORM_INICIAL);

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(FORM_INICIAL);
  };

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await updateUnidad.mutateAsync({
          id: editingId,
          data: {
            nombre: formData.nombre,
            tipoNivel: formData.tipoNivel,
            esUnidadPropia: formData.esUnidadPropia,
          },
        });
      } else {
        await createUnidad.mutateAsync(formData);
      }
      resetForm();
      refetch();
    } catch (error: any) {
      const details = error.response?.data?.details;
      const detailMsg = details ? Object.values(details).flat().join(', ') : null;
      alert('Error: ' + (detailMsg || error.response?.data?.message || 'No se pudo guardar la unidad'));
    }
  };

  const handleToggleActivo = async (unidad: Unidad) => {
    const accion = unidad.activo === false ? 'reactivar' : 'desactivar';
    if (!confirm(`¿Confirmar ${accion} la unidad "${unidad.nombre}"?`)) return;
    try {
      await updateUnidad.mutateAsync({ id: unidad.id, data: { activo: unidad.activo === false } });
      refetch();
    } catch (error: any) {
      alert('Error: ' + (error.response?.data?.message || 'No se pudo actualizar la unidad'));
    }
  };

  const startEdit = (u: Unidad) => {
    setEditingId(u.id);
    setFormData({
      codigo: u.codigo,
      nombre: u.nombre,
      tipoNivel: u.tipoNivel as FormState['tipoNivel'],
      esUnidadPropia: u.esUnidadPropia,
    });
    setShowForm(true);
  };

  if (isLoading) return <p>Cargando unidades...</p>;

  return (
    <div className="space-y-6">
      <div>
        <Button
          onClick={() => (showForm ? resetForm() : setShowForm(true))}
          variant={showForm ? 'secondary' : 'primary'}
        >
          {showForm ? '✖️ Cancelar' : '➕ Nueva Unidad'}
        </Button>
      </div>

      {showForm && (
        <Card title={editingId ? 'Editar Unidad' : 'Nueva Unidad'}>
          <div className="space-y-4">
            <Input
              label="Código"
              value={formData.codigo}
              disabled={!!editingId}
              onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
            />
            <Input
              label="Nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            />
            <Select
              label="Tipo de Nivel"
              options={TIPOS_NIVEL}
              value={formData.tipoNivel}
              onChange={(e) =>
                setFormData({ ...formData, tipoNivel: e.target.value as FormState['tipoNivel'] })
              }
            />
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={formData.esUnidadPropia}
                onChange={(e) => setFormData({ ...formData, esUnidadPropia: e.target.checked })}
              />
              Es unidad propia del cuartel
            </label>
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

      <Card title={`Unidades Organizacionales (${unidades?.length || 0})`}>
        <div className="space-y-4">
          {unidades?.map((u) => (
            <div key={u.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{u.nombre}</h3>
                  <p className="text-sm text-gray-600">Código: {u.codigo}</p>
                  <p className="text-sm text-gray-600">Tipo: {u.tipoNivel}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={u.esUnidadPropia ? 'success' : 'info'}>
                    {u.esUnidadPropia ? 'Propia' : 'Externa'}
                  </Badge>
                  <Badge variant={u.activo === false ? 'warning' : 'success'}>
                    {u.activo === false ? 'Inactiva' : 'Activa'}
                  </Badge>
                </div>
              </div>
              <div className="mt-3 space-x-2">
                <Button size="sm" onClick={() => startEdit(u)}>
                  ✏️ Editar
                </Button>
                <Button
                  size="sm"
                  variant={u.activo === false ? 'primary' : 'danger'}
                  onClick={() => handleToggleActivo(u)}
                >
                  {u.activo === false ? '✅ Reactivar' : '🚫 Desactivar'}
                </Button>
              </div>
            </div>
          ))}
          {unidades?.length === 0 && (
            <p className="text-center py-4 text-gray-600">No hay unidades registradas</p>
          )}
        </div>
      </Card>
    </div>
  );
};
