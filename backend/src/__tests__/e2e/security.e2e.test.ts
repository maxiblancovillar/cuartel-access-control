import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '@/app';

function dniUnico(): string {
  return String(90000000 + Math.floor(Math.random() * 9999999));
}

describe('E2E: Seguridad', () => {
  let operadorToken: string;
  let supervisorToken: string;

  beforeAll(async () => {
    const opRes = await request(app).post('/api/v1/auth/login').send({
      username: 'guardia_001',
      password: 'Password123!',
    });
    operadorToken = opRes.body.accessToken;

    const supRes = await request(app).post('/api/v1/auth/login').send({
      username: 'supervisor_001',
      password: 'Password123!',
    });
    supervisorToken = supRes.body.accessToken;
  });

  it('RN-03: debería impedir reingresos con el mismo DNI mientras haya un ingreso ABIERTO', async () => {
    const dni = dniUnico();
    const payload = {
      dni,
      nombre: 'Seguridad',
      apellido: 'Test',
      tipoPersona: 'CIVIL' as const,
      unidadDestinoId: 2,
      detalleVisita: {
        procedencia: 'Test',
        personaVisitada: 'Test',
        motivoVisita: 'Motivo de prueba con longitud suficiente para pasar',
      },
    };

    // Primer ingreso: debe funcionar
    const primero = await request(app)
      .post('/api/v1/access/check-in/visita')
      .set('Authorization', `Bearer ${operadorToken}`)
      .send(payload);
    expect(primero.status).toBe(201);

    // Segundo ingreso con el mismo DNI: debe ser rechazado con 409
    const segundo = await request(app)
      .post('/api/v1/access/check-in/visita')
      .set('Authorization', `Bearer ${operadorToken}`)
      .send(payload);
    expect(segundo.status).toBe(409);
    expect(segundo.body.message).toContain('ingreso abierto');
  });

  it('debería impedir acceso a rutas de OPERADOR con token de SUPERVISOR', async () => {
    const response = await request(app)
      .post('/api/v1/access/check-in/presente')
      .set('Authorization', `Bearer ${supervisorToken}`)
      .send({ dni: '38123456', unidadDestinoId: 2 });

    expect(response.status).toBe(401);
  });

  it('debería impedir acceso a rutas de SUPERVISOR/ADMIN con token de OPERADOR', async () => {
    const response = await request(app)
      .get('/api/v1/dashboard/situacion-actual')
      .set('Authorization', `Bearer ${operadorToken}`);

    expect(response.status).toBe(401);
  });

  it('debería rechazar un token con firma inválida', async () => {
    const response = await request(app)
      .get('/api/v1/access/lookup/38123456')
      .set('Authorization', 'Bearer token.invalido.aqui');

    expect(response.status).toBe(401);
  });

  it('debería rechazar peticiones sin header Authorization', async () => {
    const response = await request(app).get('/api/v1/access/lookup/38123456');
    expect(response.status).toBe(401);
  });
});
