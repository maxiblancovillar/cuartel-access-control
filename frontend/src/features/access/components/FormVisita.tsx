import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { useLookupDni, useCheckInVisita } from '@/api/hooks/useAccess';
import { useUnitsTree } from '@/api/hooks/useUnits';

const visitaSchema = z.object({
  nombre: z.string().min(2, 'Nombre mínimo 2 caracteres'),
  apellido: z.string().min(2, 'Apellido mínimo 2 caracteres'),
  tipoPersona: z.enum(['MILITAR_EXTERNO', 'CIVIL']),
  unidadDestinoId: z.string().min(1, 'Seleccionar unidad'),
  dominio: z.string().optional(),
  procedencia: z.string().min(2, 'Procedencia requerida'),
  personaVisitada: z.string().min(2, 'Persona a visitar requerida'),
  motivoVisita: z.string().min(10, 'Motivo mínimo 10 caracteres'),
});

type VisitaFormData = z.infer<typeof visitaSchema>;

interface FormVisitaProps {
  dni: string;
  /** Se invoca tras registrar la visita correctamente, para volver a la
   * pantalla de escaneo (limpiar el DNI actual) y permitir el siguiente ingreso. */
  onSuccess?: () => void;
}

export const FormVisita: React.FC<FormVisitaProps> = ({ dni, onSuccess }) => {
  useLookupDni(dni);
  const { data: unidades } = useUnitsTree();
  const checkInVisita = useCheckInVisita();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<VisitaFormData>({
    resolver: zodResolver(visitaSchema),
  });

  const onSubmit = async (data: VisitaFormData) => {
    try {
      await checkInVisita.mutateAsync({
        dni,
        nombre: data.nombre,
        apellido: data.apellido,
        tipoPersona: data.tipoPersona,
        unidadDestinoId: parseInt(data.unidadDestinoId),
        dominio: data.dominio || undefined,
        detalleVisita: {
          procedencia: data.procedencia,
          personaVisitada: data.personaVisitada,
          motivoVisita: data.motivoVisita,
        },
      });
      alert('✅ Ficha de visita registrada correctamente');
      onSuccess?.();
    } catch (error: any) {
      setError('root', {
        message: error.response?.data?.message || 'Error al registrar visita',
      });
    }
  };

  const unidadesOptions = unidades?.map((u) => ({ value: u.id, label: u.nombre })) || [];

  const tiposPersona = [
    { value: 'MILITAR_EXTERNO', label: 'Militar Externo' },
    { value: 'CIVIL', label: 'Civil' },
  ];

  return (
    <Card title="Registrar Ficha de Visita">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {errors.root && <Alert variant="danger">{errors.root.message}</Alert>}

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Nombre"
            placeholder="Nombre del visitante"
            {...register('nombre')}
            error={errors.nombre?.message}
          />
          <Input
            label="Apellido"
            placeholder="Apellido del visitante"
            {...register('apellido')}
            error={errors.apellido?.message}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Tipo de Persona"
            options={tiposPersona}
            {...register('tipoPersona')}
            error={errors.tipoPersona?.message}
          />
          <Input
            label="Dominio (opcional)"
            placeholder="AAA123"
            {...register('dominio')}
            error={errors.dominio?.message}
          />
        </div>

        <Select
          label="Unidad Destino"
          options={unidadesOptions}
          {...register('unidadDestinoId')}
          error={errors.unidadDestinoId?.message}
        />

        <Input
          label="Procedencia"
          placeholder="Ciudad/Localidad"
          {...register('procedencia')}
          error={errors.procedencia?.message}
        />

        <Input
          label="Persona a Visitar"
          placeholder="Nombre del contacto"
          {...register('personaVisitada')}
          error={errors.personaVisitada?.message}
        />

        <Input
          label="Motivo de la Visita"
          placeholder="Descripción detallada del motivo"
          {...register('motivoVisita')}
          error={errors.motivoVisita?.message}
        />

        <Button type="submit" isLoading={isSubmitting} className="w-full">
          ✅ Registrar Visita
        </Button>
      </form>
    </Card>
  );
};
