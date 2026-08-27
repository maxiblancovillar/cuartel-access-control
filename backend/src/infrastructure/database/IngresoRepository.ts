import prisma from './prisma';
import { IIngresoRepository } from '@/domain/interfaces';

export class IngresoRepository implements IIngresoRepository {
  async findActiveByDni(dni: string) {
    return await prisma.registroIngreso.findFirst({
      where: {
        persona: { dni },
        estado: 'ABIERTO',
      },
      include: {
        persona: true,
        vehiculo: true,
        unidadDestino: true,
      },
    });
  }

  async findById(id: string) {
    return await prisma.registroIngreso.findUnique({
      where: { id },
      include: {
        persona: true,
        vehiculo: true,
        unidadDestino: true,
        detalleVisita: true,
        operadorIngreso: {
          select: {
            id: true,
            nombreCompleto: true,
          },
        },
        operadorEgreso: {
          select: {
            id: true,
            nombreCompleto: true,
          },
        },
      },
    });
  }

  async create(data: any) {
    return await prisma.registroIngreso.create({
      data,
      include: {
        persona: true,
        vehiculo: true,
      },
    });
  }

  async update(id: string, data: any) {
    return await prisma.registroIngreso.update({
      where: { id },
      data,
    });
  }

  async findByDateRange(desde: Date, hasta: Date) {
    return await prisma.registroIngreso.findMany({
      where: {
        fechaIngreso: {
          gte: desde,
          lte: hasta,
        },
      },
      include: {
        persona: true,
        vehiculo: true,
      },
    });
  }

  async findByEstado(estado: string) {
    return await prisma.registroIngreso.findMany({
      where: { estado: estado as any },
      include: {
        persona: true,
        vehiculo: true,
      },
    });
  }
}
