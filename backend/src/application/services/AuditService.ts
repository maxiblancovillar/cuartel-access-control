import { IAuditLogRepository } from '@/domain/interfaces';

/**
 * Servicio central de auditoría. Registra eventos de seguridad y
 * administración (login, gestión de usuarios) para su consulta posterior
 * en /admin/audit-logs (solo ADMIN).
 *
 * No se auditan aquí las operaciones de check-in/check-out del día a día
 * (fuera del alcance de esta tarea); esas quedan registradas igualmente
 * en registros_ingresos vía operadorIngresoId/operadorEgresoId.
 */
export class AuditService {
  constructor(private auditLogRepo: IAuditLogRepository) {}

  async registrar(params: {
    usuarioId?: string | null;
    usuarioUsername: string;
    accion: string;
    recurso: string;
    exitoso: boolean;
    detalle?: string;
  }): Promise<void> {
    try {
      await this.auditLogRepo.create({
        usuarioId: params.usuarioId ?? null,
        usuarioUsername: params.usuarioUsername,
        accion: params.accion,
        recurso: params.recurso,
        exitoso: params.exitoso,
        detalle: params.detalle,
      });
    } catch (error) {
      // La auditoría no debe romper el flujo principal de la aplicación
      // si falla la escritura del log (p. ej. problema transitorio de BD).
      console.error('Error registrando audit log:', error);
    }
  }

  async obtenerRecientes(limit: number = 50) {
    return await this.auditLogRepo.findRecent(limit);
  }
}
