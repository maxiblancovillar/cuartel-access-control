import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '@/app';

describe('Auth Integration Tests', () => {
  describe('POST /api/v1/auth/login', () => {
    it('debería retornar token con credenciales válidas de OPERADOR', async () => {
      const response = await request(app).post('/api/v1/auth/login').send({
        username: 'guardia_001',
        password: 'Password123!',
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.usuario.rol).toBe('OPERADOR');
    });

    it('debería retornar token con credenciales válidas de SUPERVISOR', async () => {
      const response = await request(app).post('/api/v1/auth/login').send({
        username: 'supervisor_001',
        password: 'Password123!',
      });

      expect(response.status).toBe(200);
      expect(response.body.usuario.rol).toBe('SUPERVISOR');
    });

    it('debería rechazar contraseña incorrecta', async () => {
      const response = await request(app).post('/api/v1/auth/login').send({
        username: 'guardia_001',
        password: 'WrongPassword123!',
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
    });

    it('debería rechazar usuario inexistente', async () => {
      const response = await request(app).post('/api/v1/auth/login').send({
        username: 'nonexistent_user',
        password: 'Password123!',
      });

      expect(response.status).toBe(401);
    });

    it('debería rechazar body inválido (validación Zod)', async () => {
      const response = await request(app).post('/api/v1/auth/login').send({
        username: 'ab', // menor al mínimo de 3 caracteres
        password: '123', // menor al mínimo de 8 caracteres
      });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('debería requerir autenticación', async () => {
      const response = await request(app).post('/api/v1/auth/logout');
      expect(response.status).toBe(401);
    });

    it('debería cerrar sesión con token válido', async () => {
      const loginRes = await request(app).post('/api/v1/auth/login').send({
        username: 'guardia_001',
        password: 'Password123!',
      });

      const response = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${loginRes.body.accessToken}`);

      expect(response.status).toBe(204);
    });
  });
});
