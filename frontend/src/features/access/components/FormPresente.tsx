import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { useLookupDni, useCheckInPresente } from '@/api/hooks/useAccess';
import { useUnitsTree } from '@/api/hooks/useUnits';

const presenteSchema = z.object({
  unidadDestinoId: z.string().min(1, 'Seleccionar unidad'),
  sectorId: z.string().optional(),
  observaciones: z.string().optional(),
});

type PresenteFormData = z.infer<typeof presenteSchema>;

interface FormPresenteProps {
  dni: string;
}

export const FormPresente: React.FC<FormPresenteProps> = ({ dni }) => {
  const { data: persona, isLoading: loadingPersona } = useLookupDni(dni);
  const { data: unidades } = useUnitsTree();
  const checkInPresente = useCheckInPresente();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<PresenteFormData>({
    resolver: zodResolver(presenteSchema),
  });

  const onSubmit = async (data: PresenteFormData) => {
    try {
      await checkInPresente.mutateAsync({
        dni,
        unidadDestinoId: parseInt(data.unidadDestinoId),
        sectorId: data.sectorId ? parseInt(data.sectorId) : undefined,
        observaciones: data.observaciones,
      });
      alert('✅ Presente registrado correctamente');
    } catch (error: any) {
      setError('root', {
        message: error.response?.data?.message || 'Error al registrar presente',
      });
    }
  };

  if (loadingPersona) return <p>Cargando...</p>;

  if (!persona) {
    return <Alert variant="danger">DNI no encontrado</Alert>;
  }

  if (persona.tipoPersona !== 'MILITAR_PROPIO' || !persona.militar?.unidadRevista?.esUnidadPropia) {
    return <Alert variant="danger">Este DNI no corresponde a personal propio del cuartel</Alert>;
  }

  const unidadesOptions = unidades?.map((u) => ({ value: u.id, label: u.nombre })) || [];

  return (
    <Card title="Registrar Presente">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {errors.root && <Alert variant="danger">{errors.root.message}</Alert>}

        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="font-semibold">
            {persona.nombre} {persona.apellido}
          </p>
          <p className="text-sm text-gray-600">
            {persona.militar?.grado} - {persona.militar?.unidadRevista?.nombre}
          </p>
        </div>

        <Select
          label="Unidad Destino"
          options={unidadesOptions}
          {...register('unidadDestinoId')}
          error={errors.unidadDestinoId?.message}
        />

        <Input label="Observaciones" placeholder="Comentarios adicionales (opcional)" {...register('observaciones')} />

        <Button type="submit" isLoading={isSubmitting} className="w-full">
          ✅ Registrar Presente
        </Button>
      </form>
    </Card>
  );
};
