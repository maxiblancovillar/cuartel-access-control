import { Request, Response, NextFunction } from 'express';
import { UnauthorizedException } from '@/domain/errors/UnauthorizedException';

export function roleGuard(...rolesPermitidos: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    if (!rolesPermitidos.includes(req.user.rol)) {
      throw new UnauthorizedException(`Rol requerido: ${rolesPermitidos.join(', ')}`);
    }

    next();
  };
}
