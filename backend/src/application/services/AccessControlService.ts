import { PersonNotFoundException } from '@/domain/errors/PersonNotFoundException';
import { ConflictActiveIngressException } from '@/domain/errors/ConflictActiveIngressException';
import { ValidationException } from '@/domain/errors/ValidationException';
import { IPersonaRepository, IIngresoRepository } from '@/domain/interfaces';
import { Dominio } from '@/domain/value-objects/Dominio';
import prisma from '@/infrastructure/database/prisma';

export class AccessControlService {
  constructor(
    private personaRepo: IPersonaRepository,
    private ingresoRepo: IIngresoRepository
  ) {}

  async checkInPresente(
    dni: string,
    unidadDestinoId: number,
    sectorId: number | null,
    vehiculoId: string | null,
    operadorIngresoId: string,
    observaciones?: string
  ): Promise<any> {
    // RN-03: Verificar unicidad
    const ingresoActivo = await this.ingresoRepo.findActiveByDni(dni);
    if (ingresoActivo) {
      throw new ConflictActiveIngressException(dni);
    }

    // Buscar persona
    const persona = await this.personaRepo.findByDni(dni);
    if (!persona) {
      throw new PersonNotFoundException(dni);
    }

    // Verificar que es personal propio
    if (persona.tipoPersona !== 'MILITAR_PROPIO') {
      throw new ValidationException({
        dni: ['Este DNI no corresponde a personal propio'],
      });
    }

    // Crear ingreso
    const ingreso = await this.ingresoRepo.create({
      personaId: persona.id,
      unidadDestinoId,
      sectorId,
      vehiculoId,
      operadorIngresoId,
      observaciones,
      estado: 'ABIERTO',
      horaIngreso: new Date().toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      // fichaNro es NULL para personal propio
    });

    return ingreso;
  }

  async checkInVisita(
    dni: string,
    nombre: string,
    apellido: string,
    tipoPersona: 'MILITAR_EXTERNO' | 'CIVIL',
    unidadDestinoId: number,
    sectorId: number | null,
    dominio: string | null,
    detalleVisita: any,
    operadorIngresoId: string,
    observaciones?: string
  ): Promise<any> {
    // RN-03: Verificar unicidad
    const ingresoActivo = await this.ingresoRepo.findActiveByDni(dni);
    if (ingresoActivo) {
      throw new ConflictActiveIngressException(dni);
    }

    let persona = await this.personaRepo.findByDni(dni);

    // Si no existe, crear persona
    if (!persona) {
      persona = await this.personaRepo.create({
        dni,
        nombre,
        apellido,
        tipoPersona,
        tipoDocumento: 'DNI',
        activo: true,
      });
    }

    // Manejar vehículo
    let vehiculoId: string | null = null;
    if (dominio) {
      const dominioVO = new Dominio(dominio);
      const vehiculoExistente = await prisma.vehiculo.findUnique({
        where: { dominio: dominioVO.getValue() },
      });

      if (vehiculoExistente) {
        vehiculoId = vehiculoExistente.id;
      } else {
        // Crear nuevo vehículo (campos requeridos en request)
        const nuevoVehiculo = await prisma.vehiculo.create({
          data: {
            dominio: dominioVO.getValue(),
            titularPersonaId: persona.id,
          } as any,
        });
        vehiculoId = nuevoVehiculo.id;
      }
    }

    // Generar número de ficha correlativa
    const fichaNro = await this.generarFichaCorrelativa();

    // Crear ingreso
    const ingreso = await this.ingresoRepo.create({
      personaId: persona.id,
      unidadDestinoId,
      sectorId,
      vehiculoId,
      fichaNro,
      operadorIngresoId,
      observaciones,
      estado: 'ABIERTO',
      horaIngreso: new Date().toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    });

    // Crear detalle de visita
    if (detalleVisita) {
      await prisma.detalleVisita.create({
        data: {
          ingresoId: ingreso.id,
          ...detalleVisita,
        },
      });
    }

    return ingreso;
  }

  async checkOut(ingresoId: string, operadorEgresoId: string): Promise<any> {
    const ingreso = await this.ingresoRepo.findById(ingresoId);

    if (!ingreso) {
      throw new PersonNotFoundException('Ingreso no encontrado');
    }

    if (ingreso.estado !== 'ABIERTO') {
      throw new ValidationException({
        ingresoId: ['Ingreso ya fue cerrado'],
      });
    }

    return await this.ingresoRepo.update(ingresoId, {
      estado: 'CERRADO',
      fechaEgreso: new Date(),
      operadorEgresoId,
      horaEgreso: new Date().toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    });
  }

  private async generarFichaCorrelativa(): Promise<number> {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const mañana = new Date(hoy);
    mañana.setDate(mañana.getDate() + 1);

    const ultimaFicha = await prisma.registroIngreso.findFirst({
      where: {
        fechaIngreso: { gte: hoy, lt: mañana },
        NOT: { fichaNro: null },
      },
      orderBy: { fichaNro: 'desc' },
      select: { fichaNro: true },
    });

    return (ultimaFicha?.fichaNro || 0) + 1;
  }
}
