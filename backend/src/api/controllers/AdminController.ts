import { Request, Response } from 'express';
import {
  CreateUsuarioSchema,
  UpdateUsuarioSchema,
  CreateUnidadSchema,
  UpdateUnidadSchema,
} from '../dtos/schemas';
import { AdminService } from '@/application/services/AdminService';
import { AuditService } from '@/application/services/AuditService';
import { UsuarioRepository } from '@/infrastructure/database/UsuarioRepository';
import { AuditLogRepository } from '@/infrastructure/database/AuditLogRepository';

export class AdminController {
  private adminService: AdminService;

  constructor() {
    const auditService = new AuditService(new AuditLogRepository());
    this.adminService = new AdminService(new UsuarioRepository(), auditService);
  }

  async getUsuarios(req: Request, res: Response) {
    const usuarios = await this.adminService.getUsuarios();
    res.status(200).json(usuarios);
  }

  async createUsuario(req: Request, res: Response) {
    const data = CreateUsuarioSchema.parse(req.body);
    const usuario = await this.adminService.createUsuario(data, {
      id: req.user!.usuarioId,
      username: req.user!.username,
    });
    res.status(201).json(usuario);
  }

  async updateUsuario(req: Request, res: Response) {
    const data = UpdateUsuarioSchema.parse(req.body);
    const usuario = await this.adminService.updateUsuario(req.params.id, data, {
      id: req.user!.usuarioId,
      username: req.user!.username,
    });
    res.status(200).json(usuario);
  }

  async deactivateUsuario(req: Request, res: Response) {
    await this.adminService.deactivateUsuario(req.params.id, {
      id: req.user!.usuarioId,
      username: req.user!.username,
    });
    res.status(204).send();
  }

  async getUnidades(req: Request, res: Response) {
    const unidades = await this.adminService.getUnidades();
    res.status(200).json(unidades);
  }

  async getUnidadesTree(req: Request, res: Response) {
    const unidades = await this.adminService.getUnidadesTree();
    res.status(200).json(unidades);
  }

  async createUnidad(req: Request, res: Response) {
    const data = CreateUnidadSchema.parse(req.body);
    const unidad = await this.adminService.createUnidad(data, {
      id: req.user!.usuarioId,
      username: req.user!.username,
    });
    res.status(201).json(unidad);
  }

  async updateUnidad(req: Request, res: Response) {
    const data = UpdateUnidadSchema.parse(req.body);
    const unidad = await this.adminService.updateUnidad(parseInt(req.params.id, 10), data, {
      id: req.user!.usuarioId,
      username: req.user!.username,
    });
    res.status(200).json(unidad);
  }

  async getAuditLogs(req: Request, res: Response) {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const logs = await this.adminService.getAuditLogs(limit);
    res.status(200).json(logs);
  }
}
