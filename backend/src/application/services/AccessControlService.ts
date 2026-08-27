import { PersonNotFoundException } from '@/domain/errors/PersonNotFoundException';
import { ConflictActiveIngressException } from '@/domain/errors/ConflictActiveIngressException';
import { ValidationException } from '@/domain/errors/ValidationException';
import { IPersonaRepository, IIngresoRepository } from '@/domain/interfaces';
import { Dominio } from '@/domain/value-objects/Dominio';
import prisma from '@/infrastructure/database/prisma';

/**
 * Formatea la hora actual como "HH:MM" (24hs) para respetar el límite
 * de VARCHAR(10) en las columnas hora_ingreso/hora_egreso.
 * No se usa toLocaleTimeString('es-AR', {...}) porque en algunos entornos
 * (ICU/Node) produce strings como "03:31 p. m." que exceden el límite de columna.
 */
function formatHora(fecha: Date = new Date()): string {
  const horas = String(fecha.getHours()).padStart(2, '0');
  const minutos = String(fecha.getMinutes()).padStart(2, '0');
  return `${horas}:${minutos}`;
}

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
      horaIngreso: formatHora(),
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
    observaciones?: string,
    vehiculoDatos?: {
      tipoVehiculo?: string;
      marca?: string;
      modelo?: string;
      color?: string;
    }
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
        // Crear nuevo vehículo. marca/color son NOT NULL en el schema;
        // si no se proveen datos completos, usamos placeholders "No especificado"
        // en vez de fallar el check-in por falta de un dato secundario.
        const nuevoVehiculo = await prisma.vehiculo.create({
          data: {
            dominio: dominioVO.getValue(),
            titularPersonaId: persona.id,
            tipo: (vehiculoDatos?.tipoVehiculo as any) || 'OTRO',
            marca: vehiculoDatos?.marca || 'No especificado',
            modelo: vehiculoDatos?.modelo,
            color: vehiculoDatos?.color || 'No especificado',
          },
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
      horaIngreso: formatHora(),
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
      horaEgreso: formatHora(),
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
