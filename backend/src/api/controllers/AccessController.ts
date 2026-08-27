import { Request, Response } from 'express';
import { CheckInPresenteSchema, CheckInVisitaSchema, CheckOutSchema } from '../dtos/schemas';
import { AccessControlService } from '@/application/services/AccessControlService';
import { PersonService } from '@/application/services/PersonService';
import { PersonaRepository } from '@/infrastructure/database/PersonaRepository';
import { IngresoRepository } from '@/infrastructure/database/IngresoRepository';

export class AccessController {
  private accessControlService: AccessControlService;
  private personService: PersonService;

  constructor() {
    const personaRepo = new PersonaRepository();
    const ingresoRepo = new IngresoRepository();
    this.accessControlService = new AccessControlService(personaRepo, ingresoRepo);
    this.personService = new PersonService(personaRepo);
  }

  async lookup(req: Request, res: Response) {
    const { dni } = req.params;
    const persona = await this.personService.buscarPorDni(dni);
    res.status(200).json(persona);
  }

  async checkInPresente(req: Request, res: Response) {
    const data = CheckInPresenteSchema.parse(req.body);

    const ingreso = await this.accessControlService.checkInPresente(
      data.dni,
      data.unidadDestinoId,
      data.sectorId || null,
      data.vehiculoId || null,
      req.user!.usuarioId,
      data.observaciones
    );

    res.status(201).json(ingreso);
  }

  async checkInVisita(req: Request, res: Response) {
    const data = CheckInVisitaSchema.parse(req.body);

    const ingreso = await this.accessControlService.checkInVisita(
      data.dni,
      data.nombre,
      data.apellido,
      data.tipoPersona,
      data.unidadDestinoId,
      data.sectorId || null,
      data.dominio || null,
      data.detalleVisita,
      req.user!.usuarioId,
      data.observaciones
    );

    res.status(201).json(ingreso);
  }

  async checkOut(req: Request, res: Response) {
    const { ingresoId } = req.params;
    CheckOutSchema.parse(req.body);

    const ingreso = await this.accessControlService.checkOut(ingresoId, req.user!.usuarioId);

    res.status(200).json(ingreso);
  }
}
