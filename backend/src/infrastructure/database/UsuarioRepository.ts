import prisma from './prisma';
import { IUsuarioRepository } from '@/domain/interfaces';

export class UsuarioRepository implements IUsuarioRepository {
  async findByUsername(username: string) {
    return await prisma.usuario.findUnique({
      where: { username },
      include: { rol: true },
    });
  }

  async findById(id: string) {
    return await prisma.usuario.findUnique({
      where: { id },
      include: { rol: true },
    });
  }

  async findAll() {
    return await prisma.usuario.findMany({
      include: { rol: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: any) {
    return await prisma.usuario.create({
      data,
      include: { rol: true },
    });
  }

  async update(id: string, data: any) {
    return await prisma.usuario.update({
      where: { id },
      data,
      include: { rol: true },
    });
  }
}
