import { Request, Response, NextFunction } from 'express';
import { TokenService } from '@/application/services/TokenService';
import { UnauthorizedException } from '@/domain/errors/UnauthorizedException';

const tokenService = new TokenService();

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace -- required by Express type augmentation pattern
  namespace Express {
    interface Request {
      user?: {
        usuarioId: string;
        rol: string;
      };
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedException('Token no proporcionado');
  }

  const token = authHeader.substring(7);

  try {
    const decoded = tokenService.verifyAccessToken(token);
    req.user = { usuarioId: decoded.usuarioId, rol: decoded.rol };
    next();
  } catch (_error) {
    throw new UnauthorizedException('Token inválido o expirado');
  }
}
