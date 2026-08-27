import { describe, it, expect } from 'vitest';
import jwt from 'jsonwebtoken';
import { TokenService } from '@/application/services/TokenService';
import { UnauthorizedException } from '@/domain/errors/UnauthorizedException';

describe('TokenService', () => {
  const tokenService = new TokenService();

  describe('generateAccessToken', () => {
    it('debería generar un JWT válido con 3 partes', () => {
      const token = tokenService.generateAccessToken('user-123', 'OPERADOR', 'juan');

      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3);
    });

    it('debería incluir usuarioId, rol y username en el payload', () => {
      const token = tokenService.generateAccessToken('user-456', 'SUPERVISOR', 'maria');
      const decoded = tokenService.verifyAccessToken(token);

      expect(decoded.usuarioId).toBe('user-456');
      expect(decoded.rol).toBe('SUPERVISOR');
      expect(decoded.username).toBe('maria');
    });
  });

  describe('generateRefreshToken', () => {
    it('debería generar un JWT válido con usuarioId', () => {
      const token = tokenService.generateRefreshToken('user-789');
      const decoded = tokenService.verifyRefreshToken(token);

      expect(decoded.usuarioId).toBe('user-789');
    });
  });

  describe('verifyAccessToken', () => {
    it('debería validar un token correcto', () => {
      const token = tokenService.generateAccessToken('user-999', 'ADMIN', 'admin');
      const decoded = tokenService.verifyAccessToken(token);

      expect(decoded.usuarioId).toBe('user-999');
      expect(decoded.rol).toBe('ADMIN');
    });

    it('debería rechazar un token malformado', () => {
      expect(() => tokenService.verifyAccessToken('token.invalido.fake')).toThrow(
        UnauthorizedException
      );
    });

    it('debería rechazar un token firmado con otro secreto', () => {
      const tokenAjeno = jwt.sign({ usuarioId: 'x' }, 'otro-secreto');

      expect(() => tokenService.verifyAccessToken(tokenAjeno)).toThrow(UnauthorizedException);
    });
  });

  describe('verifyRefreshToken', () => {
    it('debería rechazar un refresh token inválido', () => {
      expect(() => tokenService.verifyRefreshToken('invalido')).toThrow(UnauthorizedException);
    });
  });
});
