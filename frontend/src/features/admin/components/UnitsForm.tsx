import React from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Unidad } from '@/types';

const TIPOS_NIVEL = [
  { value: 'COMANDO_DIRECCION', label: 'Comando/Dirección' },
  { value: 'UNIDAD_ORGANISMO', label: 'Unidad/Organismo' },
  { value: 'SEDE_EXTERNA', label: 'Sede Externa' },
];

export interface UnitFormState {
  codigo: string;
  nombre: string;
  tipoNivel: 'COMANDO_DIRECCION' | 'UNIDAD_ORGANISMO' | 'SEDE_EXTERNA';
  esUnidadPropia: boolean;
  unidadPadreId: number | null;
}

interface UnitsFormProps {
  formData: UnitFormState;
  setFormData: (data: UnitFormState) => void;
  onSubmit: () => void;
  onCancel: () => void;
  editingId: number | null;
  /** Todas las unidades del árbol, aplanadas, para poblar el selector de padre. */
  allUnidades: Unidad[];
}

/** Aplana un árbol de unidades (con subunidades anidadas) a una lista simple. */
function aplanar(unidades: Unidad[]): Unidad[] {
  const resultado: Unidad[] = [];
  for (const u of unidades) {
    resultado.push(u);
    if (u.subunidades && u.subunidades.length > 0) {
      resultado.push(...aplanar(u.subunidades));
    }
  }
  return resultado;
}

/** IDs de todos los descendientes (hijos, nietos, ...) de una unidad dentro del árbol. */
function idsDescendientes(unidades: Unidad[], id: number): Set<number> {
  const ids = new Set<number>();

  function buscarYRecolectar(nodos: Unidad[]): boolean {
    for (const nodo of nodos) {
      if (nodo.id === id) {
        recolectar(nodo.subunidades ?? []);
        return true;
      }
      if (nodo.subunidades && buscarYRecolectar(nodo.subunidades)) {
        return true;
      }
    }
    return false;
  }

  function recolectar(nodos: Unidad[]) {
    for (const nodo of nodos) {
      ids.add(nodo.id);
      if (nodo.subunidades) recolectar(nodo.subunidades);
    }
  }

  buscarYRecolectar(unidades);
  return ids;
}

export const UnitsForm: React.FC<UnitsFormProps> = ({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  editingId,
  allUnidades,
}) => {
  // Una unidad no puede ser su propio padre ni el padre de uno de sus
  // descendientes (eso cerraría un ciclo); el backend también lo valida
  // (validateNoCircles), pero filtrarlo acá evita que el usuario elija una
  // opción que el servidor va a rechazar.
  const excluidos = editingId !== null ? idsDescendientes(allUnidades, editingId) : new Set<number>();
  if (editingId !== null) excluidos.add(editingId);

  const opcionesPadre = aplanar(allUnidades)
    .filter((u) => !excluidos.has(u.id))
    .map((u) => ({ value: u.id, label: `${u.nombre} (${u.codigo})` }));

  return (
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
            setFormData({ ...formData, tipoNivel: e.target.value as UnitFormState['tipoNivel'] })
          }
        />
        <Select
          label="Unidad Padre (opcional)"
          options={[{ value: '', label: 'Sin padre (Raíz)' }, ...opcionesPadre]}
          value={formData.unidadPadreId ?? ''}
          onChange={(e) =>
            setFormData({
              ...formData,
              unidadPadreId: e.target.value ? parseInt(e.target.value, 10) : null,
            })
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
          <Button onClick={onSubmit} variant="primary">
            {editingId ? '💾 Actualizar' : '➕ Crear'}
          </Button>
          <Button onClick={onCancel} variant="secondary">
            Cancelar
          </Button>
        </div>
      </div>
    </Card>
  );
};
