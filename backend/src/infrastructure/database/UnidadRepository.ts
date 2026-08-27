import prisma from './prisma';
import { IUnidadRepository } from '@/domain/interfaces';

export class UnidadRepository implements IUnidadRepository {
  async findById(id: number) {
    return await prisma.unidad.findUnique({
      where: { id },
      include: {
        sectores: true,
        subunidades: true,
      },
    });
  }

  async findByArbol() {
    return await prisma.unidad.findMany({
      where: { unidadPadreId: null },
      include: {
        subunidades: {
          include: {
            subunidades: true,
            sectores: true,
          },
        },
        sectores: true,
      },
    });
  }

  async findAll() {
    return await prisma.unidad.findMany({
      where: { activo: true },
      orderBy: { nombre: 'asc' },
    });
  }
}
