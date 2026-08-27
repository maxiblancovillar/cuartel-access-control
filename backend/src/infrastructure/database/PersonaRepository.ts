import prisma from './prisma';
import { IPersonaRepository } from '@/domain/interfaces';

export class PersonaRepository implements IPersonaRepository {
  async findByDni(dni: string) {
    return await prisma.persona.findUnique({
      where: { dni },
      include: {
        militar: {
          include: {
            unidadRevista: true,
          },
        },
        civil: true,
        vehiculos: true,
      },
    });
  }

  async findById(id: string) {
    return await prisma.persona.findUnique({
      where: { id },
      include: {
        militar: {
          include: {
            unidadRevista: true,
          },
        },
        civil: true,
      },
    });
  }

  async create(data: any) {
    return await prisma.persona.create({
      data,
      include: {
        militar: true,
        civil: true,
      },
    });
  }

  async update(id: string, data: any) {
    return await prisma.persona.update({
      where: { id },
      data,
    });
  }
}
