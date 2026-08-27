import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '@/app';

describe('Dashboard Integration Tests', () => {
  let supervisorToken: string;
  let operadorToken: string;

  beforeAll(async () => {
    const supervisorRes = await request(app).post('/api/v1/auth/login').send({
      username: 'supervisor_001',
      password: 'Password123!',
    });
    supervisorToken = supervisorRes.body.accessToken;

    const operadorRes = await request(app).post('/api/v1/auth/login').send({
      username: 'guardia_001',
      password: 'Password123!',
    });
    operadorToken = operadorRes.body.accessToken;
  });

  describe('GET /api/v1/dashboard/situacion-actual', () => {
    it('debería retornar la estructura esperada para SUPERVISOR', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/situacion-actual')
        .set('Authorization', `Bearer ${supervisorToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('kpis');
      expect(response.body).toHaveProperty('presentes');
      expect(response.body).toHaveProperty('alertas');
      expect(response.body.kpis).toHaveProperty('totalPersonasActuales');
    });

    it('debería rechazar acceso de OPERADOR (roleGuard SUPERVISOR/ADMIN)', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/situacion-actual')
        .set('Authorization', `Bearer ${operadorToken}`);

      expect(response.status).toBe(401);
    });

    it('debería rechazar sin autenticación', async () => {
      const response = await request(app).get('/api/v1/dashboard/situacion-actual');
      expect(response.status).toBe(401);
    });
  });
});
