import { Request, Response } from 'express';
import { LoginSchema } from '../dtos/schemas';
import { TokenService } from '@/application/services/TokenService';
import bcryptjs from 'bcryptjs';
import prisma from '@/infrastructure/database/prisma';
import { UnauthorizedException } from '@/domain/errors/UnauthorizedException';

export class AuthController {
  private tokenService = new TokenService();

  async login(req: Request, res: Response) {
    const { username, password } = LoginSchema.parse(req.body);

    const usuario = await prisma.usuario.findUnique({
      where: { username },
      include: { rol: true },
    });

    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException('Usuario o contraseña inválidos');
    }

    const passwordValido = await bcryptjs.compare(password, usuario.passwordHash);

    if (!passwordValido) {
      throw new UnauthorizedException('Usuario o contraseña inválidos');
    }

    const accessToken = this.tokenService.generateAccessToken(usuario.id, usuario.rol.codigo);
    const refreshToken = this.tokenService.generateRefreshToken(usuario.id);

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
