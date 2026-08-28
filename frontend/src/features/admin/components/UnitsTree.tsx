import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Unidad } from '@/types';

interface UnitsTreeProps {
  unidades: Unidad[];
  onEdit: (unidad: Unidad) => void;
  onToggleActivo: (unidad: Unidad) => void;
  onAddChild: (parentId: number) => void;
  level?: number;
}

/**
 * Renderiza recursivamente la jerarquía de unidades (subunidades dentro de
 * subunidades, sin límite de profundidad). Cada nivel se indenta con
 * padding-left proporcional a `level` para reflejar la estructura visualmente.
 */
export const UnitsTree: React.FC<UnitsTreeProps> = ({
  unidades,
  onEdit,
  onToggleActivo,
  onAddChild,
  level = 0,
}) => {
  const [colapsadas, setColapsadas] = useState<Set<number>>(new Set());

  const toggleColapso = (id: number) => {
    setColapsadas((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div>
      {unidades.map((u) => {
        const tieneHijos = (u.subunidades?.length ?? 0) > 0;
        const colapsada = colapsadas.has(u.id);

        return (
          <div key={u.id} style={{ paddingLeft: `${level * 20}px` }} className="py-1">
            <div
              data-testid={`unidad-row-${u.id}`}
              className="flex flex-wrap items-center gap-2 border rounded-lg p-3"
            >
              {tieneHijos ? (
                <button
                  type="button"
                  onClick={() => toggleColapso(u.id)}
                  aria-label={colapsada ? 'Expandir subunidades' : 'Colapsar subunidades'}
                  className="cursor-pointer"
                >
                  {colapsada ? '📁' : '📂'}
                </button>
              ) : (
                <span aria-hidden="true">📄</span>
              )}

              <div className="flex-1 min-w-[180px]">
                <span className="font-semibold">{u.nombre}</span>
                <span className="text-sm text-gray-600 ml-2">({u.codigo})</span>
              </div>

              <Badge variant="info">{u.tipoNivel}</Badge>
              <Badge variant={u.esUnidadPropia ? 'success' : 'info'}>
                {u.esUnidadPropia ? 'Propia' : 'Externa'}
              </Badge>
              <Badge variant={u.activo === false ? 'warning' : 'success'}>
                {u.activo === false ? 'Inactiva' : 'Activa'}
              </Badge>

              <div className="flex gap-2">
                <Button size="sm" onClick={() => onEdit(u)}>
                  ✏️ Editar
                </Button>
                <Button size="sm" variant="secondary" onClick={() => onAddChild(u.id)}>
                  ➕ Agregar subunidad
                </Button>
                <Button
                  size="sm"
                  variant={u.activo === false ? 'primary' : 'danger'}
                  onClick={() => onToggleActivo(u)}
                >
                  {u.activo === false ? '✅ Reactivar' : '🚫 Desactivar'}
                </Button>
              </div>
            </div>

            {tieneHijos && !colapsada && (
              <UnitsTree
                unidades={u.subunidades!}
                onEdit={onEdit}
                onToggleActivo={onToggleActivo}
                onAddChild={onAddChild}
                level={level + 1}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};
