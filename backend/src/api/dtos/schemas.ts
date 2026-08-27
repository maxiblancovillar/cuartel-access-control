import { z } from 'zod';

export const LoginSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(8),
});

export const CheckInPresenteSchema = z.object({
  dni: z.string().regex(/^\d{7,8}$/, 'DNI debe tener 7-8 dígitos'),
  unidadDestinoId: z.number().int().positive(),
  sectorId: z.number().int().positive().optional().nullable(),
  vehiculoId: z.string().uuid().optional().nullable(),
  observaciones: z.string().max(500).optional(),
});

export const CheckInVisitaSchema = z.object({
  dni: z.string().regex(/^\d{7,8}$/, 'DNI debe tener 7-8 dígitos'),
  nombre: z.string().min(2).max(80),
  apellido: z.string().min(2).max(80),
  tipoPersona: z.enum(['MILITAR_EXTERNO', 'CIVIL']),
  unidadDestinoId: z.number().int().positive(),
  sectorId: z.number().int().positive().optional().nullable(),
  dominio: z.string().optional().nullable(),
  tipoVehiculo: z.enum(['AUTO', 'CAMIONETA', 'MOTO', 'CAMION', 'UTILITARIO', 'OTRO']).optional(),
  marca: z.string().optional(),
  modelo: z.string().optional(),
  color: z.string().optional(),
  detalleVisita: z
    .object({
      procedencia: z.string().min(2).max(150),
      personaVisitada: z.string().min(2).max(120),
      motivoVisita: z.string().min(10).max(500),
    })
    .optional(),
  observaciones: z.string().max(500).optional(),
});

export const CheckOutSchema = z.object({
  observaciones: z.string().max(500).optional(),
});

export const CreateUsuarioSchema = z.object({
  username: z.string().min(3).max(50),
  nombreCompleto: z.string().min(2).max(120),
  password: z.string().min(8),
  rol: z.enum(['OPERADOR', 'SUPERVISOR', 'ADMIN']),
});

export const UpdateUsuarioSchema = z.object({
  nombreCompleto: z.string().min(2).max(120).optional(),
  rol: z.enum(['OPERADOR', 'SUPERVISOR', 'ADMIN']).optional(),
  activo: z.boolean().optional(),
  password: z.string().min(8).optional(),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type CheckInPresenteInput = z.infer<typeof CheckInPresenteSchema>;
export type CheckInVisitaInput = z.infer<typeof CheckInVisitaSchema>;
export type CheckOutInput = z.infer<typeof CheckOutSchema>;
export type CreateUsuarioInput = z.infer<typeof CreateUsuarioSchema>;
export type UpdateUsuarioInput = z.infer<typeof UpdateUsuarioSchema>;
