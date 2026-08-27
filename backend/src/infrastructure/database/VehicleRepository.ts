import prisma from './prisma';
import { IVehicleRepository } from '@/domain/interfaces';

export class VehicleRepository implements IVehicleRepository {
  async findByDominio(dominio: string) {
    return await prisma.vehiculo.findUnique({
      where: { dominio },
      include: {
        titular: true,
      },
    });
  }

  async create(data: any) {
    return await prisma.vehiculo.create({
      data,
    });
  }

  async update(id: string, data: any) {
    return await prisma.vehiculo.update({
      where: { id },
      data,
    });
  }
}
