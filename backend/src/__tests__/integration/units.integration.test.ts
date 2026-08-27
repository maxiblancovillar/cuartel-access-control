import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '@/app';

describe('Units Integration Tests', () => {
  let operadorToken: string;

  beforeAll(async () => {
    const response = await request(app).post('/api/v1/auth/login').send({
      username: 'guardia_001',
      password: 'Password123!',
    });
    operadorToken = response.body.accessToken;
  });

  describe('GET /api/v1/units/tree', () => {
    it('debería retornar el árbol de unidades (seed)', async () => {
      const response = await request(app)
        .get('/api/v1/units/tree')
        .set('Authorization', `Bearer ${operadorToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('unidades');
      expect(Array.isArray(response.body.unidades)).toBe(true);
      expect(response.body.unidades.length).toBeGreaterThan(0);
    });

    it('debería rechazar sin autenticación', async () => {
      const response = await request(app).get('/api/v1/units/tree');
      expect(response.status).toBe(401);
    });
  });
});
