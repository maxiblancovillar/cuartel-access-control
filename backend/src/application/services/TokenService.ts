import jwt from 'jsonwebtoken';
import { ITokenService } from '@/domain/interfaces';
import { UnauthorizedException } from '@/domain/errors/UnauthorizedException';

export class TokenService implements ITokenService {
  private readonly jwtSecret = process.env.JWT_SECRET || 'secret-key';
  private readonly jwtExpiresIn = process.env.JWT_EXPIRES_IN || '1h';
  private readonly refreshTokenExpiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

  generateAccessToken(usuarioId: string, rol: string): string {
    return jwt.sign({ usuarioId, rol }, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn,
    } as jwt.SignOptions);
  }

  generateRefreshToken(usuarioId: string): string {
    return jwt.sign({ usuarioId }, this.jwtSecret, {
      expiresIn: this.refreshTokenExpiresIn,
    } as jwt.SignOptions);
  }

  verifyAccessToken(token: string): any {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }

  verifyRefreshToken(token: string): any {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }
  }
}
