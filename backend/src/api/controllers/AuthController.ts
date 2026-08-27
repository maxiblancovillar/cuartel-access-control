import { Request, Response } from 'express';
import { LoginSchema } from '../dtos/schemas';
import { TokenService } from '@/application/services/TokenService';
import { AuditService } from '@/application/services/AuditService';
import { AuditLogRepository } from '@/infrastructure/database/AuditLogRepository';
import bcryptjs from 'bcryptjs';
import prisma from '@/infrastructure/database/prisma';
import { UnauthorizedException } from '@/domain/errors/UnauthorizedException';

export class AuthController {
  private tokenService = new TokenService();
  private auditService = new AuditService(new AuditLogRepository());

  async login(req: Request, res: Response) {
    const { username, password } = LoginSchema.parse(req.body);

    const usuario = await prisma.usuario.findUnique({
      where: { username },
      include: { rol: true },
    });

    if (!usuario || !usuario.activo) {
      await this.auditService.registrar({
        usuarioUsername: username,
        accion: 'LOGIN',
        recurso: 'auth',
        exitoso: false,
        detalle: 'Usuario inexistente o inactivo',
      });
      throw new UnauthorizedException('Usuario o contraseña inválidos');
    }

    const passwordValido = await bcryptjs.compare(password, usuario.passwordHash);

    if (!passwordValido) {
      await this.auditService.registrar({
        usuarioId: usuario.id,
        usuarioUsername: usuario.username,
        accion: 'LOGIN',
        recurso: 'auth',
        exitoso: false,
        detalle: 'Contraseña incorrecta',
      });
      throw new UnauthorizedException('Usuario o contraseña inválidos');
    }

    const accessToken = this.tokenService.generateAccessToken(
      usuario.id,
      usuario.rol.codigo,
      usuario.username
    );
    const refreshToken = this.tokenService.generateRefreshToken(usuario.id);

    await this.auditService.registrar({
      usuarioId: usuario.id,
      usuarioUsername: usuario.username,
      accion: 'LOGIN',
      recurso: 'auth',
      exitoso: true,
    });

    res.status(200).json({
      accessToken,
      refreshToken,
      usuario: {
        id: usuario.id,
        username: usuario.username,
        nombreCompleto: usuario.nombreCompleto,
        rol: usuario.rol.codigo,
        activo: usuario.activo,
      },
    });
  }

  logout(req: Request, res: Response) {
    res.status(204).send();
  }
}
