import bcryptjs from 'bcryptjs';
import prisma from '@/infrastructure/database/prisma';
import { IUsuarioRepository } from '@/domain/interfaces';
import { AuditService } from './AuditService';
import { NotFoundException } from '@/domain/errors/NotFoundException';
import { ValidationException } from '@/domain/errors/ValidationException';

interface CrearUsuarioInput {
  username: string;
  nombreCompleto: string;
  password: string;
  rol: 'OPERADOR' | 'SUPERVISOR' | 'ADMIN';
}

interface ActualizarUsuarioInput {
  nombreCompleto?: string;
  rol?: 'OPERADOR' | 'SUPERVISOR' | 'ADMIN';
  activo?: boolean;
  password?: string;
}

/** Formatea el usuario de Prisma (con relación `rol`) a la forma que consume el frontend. */
function formatearUsuario(usuario: any) {
  return {
    id: usuario.id,
    username: usuario.username,
    nombreCompleto: usuario.nombreCompleto,
    rol: usuario.rol.codigo,
    activo: usuario.activo,
    createdAt: usuario.createdAt,
  };
}

export class AdminService {
  constructor(
    private usuarioRepo: IUsuarioRepository,
    private auditService: AuditService
  ) {}

  async getUsuarios() {
    const usuarios = await this.usuarioRepo.findAll();
    return usuarios.map(formatearUsuario);
  }

  async createUsuario(input: CrearUsuarioInput, actor: { id: string; username: string }) {
    const rol = await prisma.rol.findUnique({ where: { codigo: input.rol } });
    if (!rol) {
      throw new ValidationException({ rol: [`Rol inválido: ${input.rol}`] });
    }

    const existente = await this.usuarioRepo.findByUsername(input.username);
    if (existente) {
      throw new ValidationException({ username: ['El nombre de usuario ya está en uso'] });
    }

    const passwordHash = await bcryptjs.hash(input.password, 10);

    const usuario = await this.usuarioRepo.create({
      username: input.username,
      nombreCompleto: input.nombreCompleto,
      passwordHash,
      rolId: rol.id,
      activo: true,
    });

    await this.auditService.registrar({
      usuarioId: actor.id,
      usuarioUsername: actor.username,
      accion: 'CREATE_USUARIO',
      recurso: `usuarios/${usuario.id}`,
      exitoso: true,
      detalle: `Creó el usuario ${usuario.username} (rol ${input.rol})`,
    });

    return formatearUsuario(usuario);
  }

  async updateUsuario(
    id: string,
    input: ActualizarUsuarioInput,
    actor: { id: string; username: string }
  ) {
    const existente = await this.usuarioRepo.findById(id);
    if (!existente) {
      throw new NotFoundException('usuario', id);
    }

    const data: Record<string, unknown> = {};

    if (input.nombreCompleto !== undefined) {
      data.nombreCompleto = input.nombreCompleto;
    }
    if (input.activo !== undefined) {
      data.activo = input.activo;
    }
    if (input.password) {
      data.passwordHash = await bcryptjs.hash(input.password, 10);
    }
    if (input.rol !== undefined) {
      const rol = await prisma.rol.findUnique({ where: { codigo: input.rol } });
      if (!rol) {
        throw new ValidationException({ rol: [`Rol inválido: ${input.rol}`] });
      }
      data.rolId = rol.id;
    }

    const usuario = await this.usuarioRepo.update(id, data);

    await this.auditService.registrar({
      usuarioId: actor.id,
      usuarioUsername: actor.username,
      accion: 'UPDATE_USUARIO',
      recurso: `usuarios/${id}`,
      exitoso: true,
      detalle: `Actualizó el usuario ${usuario.username}`,
    });

    return formatearUsuario(usuario);
  }

  /**
   * "Eliminar" un usuario se implementa como desactivación (activo=false),
   * no como DELETE físico: registros_ingresos.operador_ingreso_id /
   * operador_egreso_id referencian usuarios sin ON DELETE CASCADE, así que
   * borrar físicamente a un usuario que ya operó un ingreso rompería esa
   * integridad referencial. Desactivar preserva el historial y le impide
   * iniciar sesión (AuthController ya rechaza usuarios con activo=false).
   */
  async deactivateUsuario(id: string, actor: { id: string; username: string }) {
    const existente = await this.usuarioRepo.findById(id);
    if (!existente) {
      throw new NotFoundException('usuario', id);
    }

    if (existente.id === actor.id) {
      throw new ValidationException({ id: ['No podés desactivar tu propio usuario'] });
    }

    await this.usuarioRepo.update(id, { activo: false });

    await this.auditService.registrar({
      usuarioId: actor.id,
      usuarioUsername: actor.username,
      accion: 'DEACTIVATE_USUARIO',
      recurso: `usuarios/${id}`,
      exitoso: true,
      detalle: `Desactivó el usuario ${existente.username}`,
    });
  }

  async getUnidades() {
    return await prisma.unidad.findMany({
      include: { sectores: true },
      orderBy: { nombre: 'asc' },
    });
  }

  async getAuditLogs(limit: number = 50) {
    return await this.auditService.obtenerRecientes(limit);
  }
}
