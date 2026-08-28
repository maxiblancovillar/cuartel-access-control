import React, { useState } from 'react';
import { useUnidadesTree, useCreateUnidad, useUpdateUnidad } from '@/api/hooks/useAdmin';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { UnitsTree } from './UnitsTree';
import { UnitsForm, UnitFormState } from './UnitsForm';
import { Unidad } from '@/types';

const FORM_INICIAL: UnitFormState = {
  codigo: '',
  nombre: '',
  tipoNivel: 'UNIDAD_ORGANISMO',
  esUnidadPropia: false,
  unidadPadreId: null,
};

/** Extrae el mensaje de error más específico: los errores de validación
 * (ValidationException/ZodError) traen { message, details: { campo: [msgs] } }. */
function extraerMensajeError(error: any, fallback: string): string {
  const details = error.response?.data?.details;
  if (details && typeof details === 'object') {
    const mensajes = Object.values(details).flat().filter(Boolean);
    if (mensajes.length > 0) return mensajes.join(', ');
  }
  return error.response?.data?.message || fallback;
}

export const UnitsTab: React.FC = () => {
  const { data: unidadesTree, isLoading, refetch } = useUnidadesTree();
  const createUnidad = useCreateUnidad();
  const updateUnidad = useUpdateUnidad();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<UnitFormState>(FORM_INICIAL);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(FORM_INICIAL);
    setErrorMsg(null);
  };

  const handleSubmit = async () => {
    setErrorMsg(null);
    try {
      if (editingId) {
        await updateUnidad.mutateAsync({
          id: editingId,
          data: {
            nombre: formData.nombre,
            tipoNivel: formData.tipoNivel,
            esUnidadPropia: formData.esUnidadPropia,
            unidadPadreId: formData.unidadPadreId,
          },
        });
      } else {
        await createUnidad.mutateAsync(formData);
      }
      resetForm();
      refetch();
    } catch (error: any) {
      setErrorMsg(extraerMensajeError(error, 'No se pudo guardar la unidad'));
    }
  };

  const handleToggleActivo = async (unidad: Unidad) => {
    const accion = unidad.activo === false ? 'reactivar' : 'desactivar';
    if (!confirm(`¿Confirmar ${accion} la unidad "${unidad.nombre}"?`)) return;
    try {
      await updateUnidad.mutateAsync({ id: unidad.id, data: { activo: unidad.activo === false } });
      refetch();
    } catch (error: any) {
      alert('Error: ' + extraerMensajeError(error, 'No se pudo actualizar la unidad'));
    }
  };

  const startEdit = (u: Unidad) => {
    setEditingId(u.id);
    setFormData({
      codigo: u.codigo,
      nombre: u.nombre,
      tipoNivel: u.tipoNivel as UnitFormState['tipoNivel'],
      esUnidadPropia: u.esUnidadPropia,
      unidadPadreId: u.unidadPadreId ?? null,
    });
    setErrorMsg(null);
    setShowForm(true);
  };

  const startAddChild = (parentId: number) => {
    setEditingId(null);
    setFormData({ ...FORM_INICIAL, unidadPadreId: parentId });
    setErrorMsg(null);
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
        <div className="space-y-2">
          {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}
          <UnitsForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
            onCancel={resetForm}
            editingId={editingId}
            allUnidades={unidadesTree ?? []}
          />
        </div>
      )}

      <Card title="Estructura Organizacional">
        {unidadesTree && unidadesTree.length > 0 ? (
          <UnitsTree
            unidades={unidadesTree}
            onEdit={startEdit}
            onToggleActivo={handleToggleActivo}
            onAddChild={startAddChild}
          />
        ) : (
          <p className="text-center py-4 text-gray-600">No hay unidades registradas</p>
        )}
      </Card>
    </div>
  );
};
