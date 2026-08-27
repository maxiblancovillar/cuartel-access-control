import React from 'react';
import { useUnidadesAdmin } from '@/api/hooks/useAdmin';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export const UnitsTab: React.FC = () => {
  const { data: unidades, isLoading } = useUnidadesAdmin();

  if (isLoading) return <p>Cargando unidades...</p>;

  return (
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
              <Badge variant={u.esUnidadPropia ? 'success' : 'info'}>
                {u.esUnidadPropia ? 'Propia' : 'Externa'}
              </Badge>
            </div>
          </div>
        ))}
        {unidades?.length === 0 && (
          <p className="text-center py-4 text-gray-600">No hay unidades registradas</p>
        )}
      </div>
    </Card>
  );
};
