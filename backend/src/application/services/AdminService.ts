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

interface CrearUnidadInput {
  codigo: string;
  nombre: string;
  tipoNivel: 'COMANDO_DIRECCION' | 'UNIDAD_ORGANISMO' | 'SEDE_EXTERNA';
  esUnidadPropia?: boolean;
  unidadPadreId?: number | null;
}

interface ActualizarUnidadInput {
  nombre?: string;
  tipoNivel?: 'COMANDO_DIRECCION' | 'UNIDAD_ORGANISMO' | 'SEDE_EXTERNA';
  esUnidadPropia?: boolean;
  activo?: boolean;
  unidadPadreId?: number | null;
}

/**
 * Verifica que asignar `nuevoPadreId` como padre de `unidadId` no genere un
 * ciclo en la jerarquía (p. ej. A → B → A). Se recorre la cadena de
 * ancestros de `nuevoPadreId` usando `obtenerPadreId`: si en algún punto se
 * encuentra `unidadId`, significa que `unidadId` ya es ancestro de
 * `nuevoPadreId` y asignarlo como su padre cerraría el ciclo.
 *
 * Se recibe `obtenerPadreId` como dependencia (en vez de golpear Prisma
 * directamente) para poder testear la lógica de recorrido con datos en
 * memoria, sin mockear la base de datos.
 */
export async function validateNoCircles(
  unidadId: number,
  nuevoPadreId: number,
  obtenerPadreId: (id: number) => Promise<number | null>
): Promise<boolean> {
  if (unidadId === nuevoPadreId) {
    return false;
  }

  const visitados = new Set<number>();
  let actual: number | null = nuevoPadreId;

  while (actual !== null) {
    if (actual === unidadId) {
      return false;
    }
    if (visitados.has(actual)) {
      // Ciclo preexistente ajeno a esta operación (no debería ocurrir si
      // todas las asignaciones pasaron por esta validación, pero cortamos
      // el recorrido defensivamente para no entrar en loop infinito).
      return false;
    }
    visitados.add(actual);
    actual = await obtenerPadreId(actual);
  }

  return true;
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

  /**
   * Devuelve la jerarquía completa de unidades como árbol anidado
   * (subunidades dentro de subunidades, sin límite de profundidad), a
   * diferencia de getUnidades() que devuelve la lista plana.
   *
   * Se trae toda la tabla en una sola query y se arma el árbol en memoria
   * (evita 1 query por nivel de profundidad); el volumen de unidades de un
   * cuartel es lo bastante chico para que esto no sea un problema de
   * rendimiento.
   */
  async getUnidadesTree() {
    const todas = await prisma.unidad.findMany({
      include: { sectores: true },
      orderBy: { nombre: 'asc' },
    });

    const porId = new Map<number, (typeof todas)[number] & { subunidades: unknown[] }>();
    for (const unidad of todas) {
      porId.set(unidad.id, { ...unidad, subunidades: [] });
    }

    const raices: Array<(typeof todas)[number] & { subunidades: unknown[] }> = [];
    for (const unidad of todas) {
      const nodo = porId.get(unidad.id)!;
      if (unidad.unidadPadreId !== null && porId.has(unidad.unidadPadreId)) {
        (porId.get(unidad.unidadPadreId)!.subunidades as unknown[]).push(nodo);
      } else {
        raices.push(nodo);
      }
    }

    return raices;
  }

  async createUnidad(input: CrearUnidadInput, actor: { id: string; username: string }) {
    const existente = await prisma.unidad.findUnique({ where: { codigo: input.codigo } });
    if (existente) {
      throw new ValidationException({ codigo: ['Ya existe una unidad con ese código'] });
    }

    if (input.unidadPadreId !== undefined && input.unidadPadreId !== null) {
      const padre = await prisma.unidad.findUnique({ where: { id: input.unidadPadreId } });
      if (!padre) {
        throw new ValidationException({ unidadPadreId: ['La unidad padre indicada no existe'] });
      }
    }

    const unidad = await prisma.unidad.create({
      data: {
        codigo: input.codigo,
        nombre: input.nombre,
        tipoNivel: input.tipoNivel,
        esUnidadPropia: input.esUnidadPropia ?? false,
        unidadPadreId: input.unidadPadreId ?? null,
      },
      include: { sectores: true },
    });

    await this.auditService.registrar({
      usuarioId: actor.id,
      usuarioUsername: actor.username,
      accion: 'CREATE_UNIDAD',
      recurso: `unidades/${unidad.id}`,
      exitoso: true,
      detalle: `Creó la unidad ${unidad.nombre} (${unidad.codigo})`,
    });

    return unidad;
  }

  async updateUnidad(
    id: number,
    input: ActualizarUnidadInput,
    actor: { id: string; username: string }
  ) {
    const existente = await prisma.unidad.findUnique({ where: { id } });
    if (!existente) {
      throw new NotFoundException('unidad', String(id));
    }

    if (input.unidadPadreId !== undefined && input.unidadPadreId !== null) {
      const padre = await prisma.unidad.findUnique({ where: { id: input.unidadPadreId } });
      if (!padre) {
        throw new ValidationException({ unidadPadreId: ['La unidad padre indicada no existe'] });
      }

      const esValido = await validateNoCircles(id, input.unidadPadreId, async (unidadIdActual) => {
        const u = await prisma.unidad.findUnique({ where: { id: unidadIdActual } });
        return u?.unidadPadreId ?? null;
      });

      if (!esValido) {
        throw new ValidationException({
          unidadPadreId: ['No se puede crear un ciclo: la unidad padre elegida es descendiente de esta unidad'],
        });
      }
    }

    const unidad = await prisma.unidad.update({
      where: { id },
      data: {
        nombre: input.nombre,
        tipoNivel: input.tipoNivel,
        esUnidadPropia: input.esUnidadPropia,
        activo: input.activo,
        unidadPadreId: input.unidadPadreId,
      },
      include: { sectores: true },
    });

    await this.auditService.registrar({
      usuarioId: actor.id,
      usuarioUsername: actor.username,
      accion: 'UPDATE_UNIDAD',
      recurso: `unidades/${id}`,
      exitoso: true,
      detalle: `Actualizó la unidad ${unidad.nombre} (${unidad.codigo})`,
    });

    return unidad;
  }

  async getAuditLogs(limit: number = 50) {
    return await this.auditService.obtenerRecientes(limit);
  }
}
