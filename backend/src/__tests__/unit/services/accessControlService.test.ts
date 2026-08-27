import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AccessControlService } from '@/application/services/AccessControlService';
import { ConflictActiveIngressException } from '@/domain/errors/ConflictActiveIngressException';
import { PersonNotFoundException } from '@/domain/errors/PersonNotFoundException';
import { ValidationException } from '@/domain/errors/ValidationException';
import type { IPersonaRepository, IIngresoRepository } from '@/domain/interfaces';

describe('AccessControlService', () => {
  let personaRepo: IPersonaRepository;
  let ingresoRepo: IIngresoRepository;
  let service: AccessControlService;

  beforeEach(() => {
    personaRepo = {
      findByDni: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    };
    ingresoRepo = {
      findActiveByDni: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      findByDateRange: vi.fn(),
      findByEstado: vi.fn(),
    };
    service = new AccessControlService(personaRepo, ingresoRepo);
  });

  describe('checkInPresente', () => {
    it('debería registrar un presente exitosamente si es personal propio', async () => {
      (ingresoRepo.findActiveByDni as any).mockResolvedValue(null);
      (personaRepo.findByDni as any).mockResolvedValue({
        id: 'persona-1',
        dni: '38123456',
        tipoPersona: 'MILITAR_PROPIO',
      });
      (ingresoRepo.create as any).mockResolvedValue({
        id: 'ingreso-1',
        estado: 'ABIERTO',
        personaId: 'persona-1',
      });

      const resultado = await service.checkInPresente('38123456', 1, null, null, 'op-1');

      expect(resultado.estado).toBe('ABIERTO');
      expect(ingresoRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          personaId: 'persona-1',
          unidadDestinoId: 1,
          estado: 'ABIERTO',
        })
      );
    });

    it('debería rechazar con ConflictActiveIngressException si ya hay ingreso abierto (RN-03)', async () => {
      (ingresoRepo.findActiveByDni as any).mockResolvedValue({ id: 'ingreso-existente' });

      await expect(service.checkInPresente('38123456', 1, null, null, 'op-1')).rejects.toThrow(
        ConflictActiveIngressException
      );

      expect(personaRepo.findByDni).not.toHaveBeenCalled();
    });

    it('debería rechazar con PersonNotFoundException si el DNI no existe', async () => {
      (ingresoRepo.findActiveByDni as any).mockResolvedValue(null);
      (personaRepo.findByDni as any).mockResolvedValue(null);

      await expect(service.checkInPresente('99999999', 1, null, null, 'op-1')).rejects.toThrow(
        PersonNotFoundException
      );
    });

    it('debería rechazar con ValidationException si la persona no es personal propio', async () => {
      (ingresoRepo.findActiveByDni as any).mockResolvedValue(null);
      (personaRepo.findByDni as any).mockResolvedValue({
        id: 'persona-civil',
        tipoPersona: 'CIVIL',
      });

      await expect(service.checkInPresente('42987654', 1, null, null, 'op-1')).rejects.toThrow(
        ValidationException
      );
    });
  });

  describe('checkOut', () => {
    it('debería cerrar un ingreso abierto correctamente', async () => {
      (ingresoRepo.findById as any).mockResolvedValue({
        id: 'ingreso-1',
        estado: 'ABIERTO',
      });
      (ingresoRepo.update as any).mockResolvedValue({
        id: 'ingreso-1',
        estado: 'CERRADO',
        fechaEgreso: new Date(),
      });

      const resultado = await service.checkOut('ingreso-1', 'op-1');

      expect(resultado.estado).toBe('CERRADO');
      expect(ingresoRepo.update).toHaveBeenCalledWith(
        'ingreso-1',
        expect.objectContaining({ estado: 'CERRADO', operadorEgresoId: 'op-1' })
      );
    });

    it('debería rechazar con PersonNotFoundException si el ingreso no existe', async () => {
      (ingresoRepo.findById as any).mockResolvedValue(null);

      await expect(service.checkOut('inexistente', 'op-1')).rejects.toThrow(
        PersonNotFoundException
      );
    });

    it('debería rechazar con ValidationException si el ingreso ya está cerrado', async () => {
      (ingresoRepo.findById as any).mockResolvedValue({
        id: 'ingreso-1',
        estado: 'CERRADO',
      });

      await expect(service.checkOut('ingreso-1', 'op-1')).rejects.toThrow(ValidationException);
    });
  });
});
