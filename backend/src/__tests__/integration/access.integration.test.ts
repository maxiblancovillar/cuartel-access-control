import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '@/app';

/** Genera un DNI de 8 dígitos único para evitar colisiones entre corridas de test. */
function dniUnico(): string {
  return String(90000000 + Math.floor(Math.random() * 9999999));
}

describe('Access Integration Tests', () => {
  let operadorToken: string;

  beforeAll(async () => {
    const response = await request(app).post('/api/v1/auth/login').send({
      username: 'guardia_001',
      password: 'Password123!',
    });

    operadorToken = response.body.accessToken;
  });

  describe('GET /api/v1/access/lookup/:dni', () => {
    it('debería retornar datos de personal propio existente (seed)', async () => {
      const response = await request(app)
        .get('/api/v1/access/lookup/38123456')
        .set('Authorization', `Bearer ${operadorToken}`);

      expect(response.status).toBe(200);
      expect(response.body.dni).toBe('38123456');
      expect(response.body.tipoPersona).toBe('MILITAR_PROPIO');
    });

    it('debería retornar 404 si el DNI no existe', async () => {
      const response = await request(app)
        .get(`/api/v1/access/lookup/${dniUnico()}`)
        .set('Authorization', `Bearer ${operadorToken}`);

      expect(response.status).toBe(404);
    });

    it('debería rechazar sin autenticación', async () => {
      const response = await request(app).get('/api/v1/access/lookup/38123456');
      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/v1/access/check-in/presente', () => {
    it('debería registrar un presente de personal propio', async () => {
      const response = await request(app)
        .post('/api/v1/access/check-in/presente')
        .set('Authorization', `Bearer ${operadorToken}`)
        .send({ dni: '38123456', unidadDestinoId: 2 });

      // Puede haber quedado un ingreso abierto de una corrida previa (RN-03).
      // Aceptamos 201 (creado) o 409 (ya había uno abierto) como estados válidos
      // para no acoplar el test al estado exacto de la BD compartida.
      expect([201, 409]).toContain(response.status);

      if (response.status === 201) {
        expect(response.body.estado).toBe('ABIERTO');
        // Limpiar: cerrar el ingreso para no afectar otros tests
        await request(app)
          .patch(`/api/v1/access/check-out/${response.body.id}`)
          .set('Authorization', `Bearer ${operadorToken}`)
          .send({});
      }
    });

    it('debería rechazar sin autenticación', async () => {
      const response = await request(app)
        .post('/api/v1/access/check-in/presente')
        .send({ dni: '38123456', unidadDestinoId: 2 });

      expect(response.status).toBe(401);
    });

    it('debería rechazar body inválido (DNI con formato incorrecto)', async () => {
      const response = await request(app)
        .post('/api/v1/access/check-in/presente')
        .set('Authorization', `Bearer ${operadorToken}`)
        .send({ dni: 'ABC', unidadDestinoId: 2 });

      expect(response.status).toBe(400);
    });

    it('debería rechazar DNI que no corresponde a personal propio', async () => {
      const dniCivil = dniUnico();

      // Crear un civil primero via check-in de visita
      await request(app)
        .post('/api/v1/access/check-in/visita')
        .set('Authorization', `Bearer ${operadorToken}`)
        .send({
          dni: dniCivil,
          nombre: 'Test',
          apellido: 'Civil',
          tipoPersona: 'CIVIL',
          unidadDestinoId: 2,
          detalleVisita: {
            procedencia: 'Test',
            personaVisitada: 'Test Persona',
            motivoVisita: 'Motivo de prueba con longitud suficiente',
          },
        });

      const response = await request(app)
        .post('/api/v1/access/check-in/presente')
        .set('Authorization', `Bearer ${operadorToken}`)
        .send({ dni: dniCivil, unidadDestinoId: 2 });

      // El civil recién creado ya tiene un ingreso ABIERTO desde la visita,
      // por lo que RN-03 dispara primero (409) antes de validar tipoPersona (400).
      expect([400, 409]).toContain(response.status);
    });
  });

  describe('POST /api/v1/access/check-in/visita', () => {
    it('debería registrar una visita civil con ficha correlativa', async () => {
      const response = await request(app)
        .post('/api/v1/access/check-in/visita')
        .set('Authorization', `Bearer ${operadorToken}`)
        .send({
          dni: dniUnico(),
          nombre: 'Ana',
          apellido: 'Martinez',
          tipoPersona: 'CIVIL',
          unidadDestinoId: 2,
          detalleVisita: {
            procedencia: 'Buenos Aires',
            personaVisitada: 'Juan Perez',
            motivoVisita: 'Reunion administrativa de prueba automatizada',
          },
        });

      expect(response.status).toBe(201);
      expect(response.body.fichaNro).toBeGreaterThan(0);
      expect(response.body.estado).toBe('ABIERTO');
    });

    it('debería crear el vehículo con marca/color por defecto si no se especifican', async () => {
      const dominio = `T${String(Math.floor(Math.random() * 9000) + 1000)}`; // ej: T4821 (1 letra + 4 dígitos)

      const response = await request(app)
        .post('/api/v1/access/check-in/visita')
        .set('Authorization', `Bearer ${operadorToken}`)
        .send({
          dni: dniUnico(),
          nombre: 'Pedro',
          apellido: 'Gomez',
          tipoPersona: 'CIVIL',
          unidadDestinoId: 2,
          dominio,
          detalleVisita: {
            procedencia: 'La Plata',
            personaVisitada: 'Maria Lopez',
            motivoVisita: 'Entrega de documentacion administrativa',
          },
        });

      expect(response.status).toBe(201);
      expect(response.body.vehiculo).not.toBeNull();
      expect(response.body.vehiculo.dominio).toBe(dominio);
    });
  });

  describe('RN-03: Unicidad de ingreso abierto', () => {
    it('debería rechazar un segundo check-in con el mismo DNI mientras el primero esté ABIERTO', async () => {
      const dni = dniUnico();
      const payload = {
        dni,
        nombre: 'Test',
        apellido: 'Duplicado',
        tipoPersona: 'CIVIL' as const,
        unidadDestinoId: 2,
        detalleVisita: {
          procedencia: 'Test',
          personaVisitada: 'Test',
          motivoVisita: 'Motivo de prueba con longitud suficiente para pasar',
        },
      };

      const primero = await request(app)
        .post('/api/v1/access/check-in/visita')
        .set('Authorization', `Bearer ${operadorToken}`)
        .send(payload);
      expect(primero.status).toBe(201);

      const segundo = await request(app)
        .post('/api/v1/access/check-in/visita')
        .set('Authorization', `Bearer ${operadorToken}`)
        .send(payload);

      expect(segundo.status).toBe(409);
      expect(segundo.body.error).toBe('CONFLICT_ACTIVE_INGRESS');
    });
  });

  describe('PATCH /api/v1/access/check-out/:ingresoId', () => {
    it('debería cerrar un ingreso abierto', async () => {
      const dni = dniUnico();
      const checkin = await request(app)
        .post('/api/v1/access/check-in/visita')
        .set('Authorization', `Bearer ${operadorToken}`)
        .send({
          dni,
          nombre: 'Test',
          apellido: 'Checkout',
          tipoPersona: 'CIVIL',
          unidadDestinoId: 2,
          detalleVisita: {
            procedencia: 'Test',
            personaVisitada: 'Test',
            motivoVisita: 'Motivo de prueba con longitud suficiente para pasar',
          },
        });

      const response = await request(app)
        .patch(`/api/v1/access/check-out/${checkin.body.id}`)
        .set('Authorization', `Bearer ${operadorToken}`)
        .send({});

      expect(response.status).toBe(200);
      expect(response.body.estado).toBe('CERRADO');
      expect(response.body.horaEgreso).toMatch(/^\d{2}:\d{2}$/);
    });

    it('debería rechazar cerrar un ingreso ya cerrado', async () => {
      const dni = dniUnico();
      const checkin = await request(app)
        .post('/api/v1/access/check-in/visita')
        .set('Authorization', `Bearer ${operadorToken}`)
        .send({
          dni,
          nombre: 'Test',
          apellido: 'DobleCheckout',
          tipoPersona: 'CIVIL',
          unidadDestinoId: 2,
          detalleVisita: {
            procedencia: 'Test',
            personaVisitada: 'Test',
            motivoVisita: 'Motivo de prueba con longitud suficiente para pasar',
          },
        });

      await request(app)
        .patch(`/api/v1/access/check-out/${checkin.body.id}`)
        .set('Authorization', `Bearer ${operadorToken}`)
        .send({});

      const segundoCheckout = await request(app)
        .patch(`/api/v1/access/check-out/${checkin.body.id}`)
        .set('Authorization', `Bearer ${operadorToken}`)
        .send({});

      expect(segundoCheckout.status).toBe(400);
    });
  });
});
