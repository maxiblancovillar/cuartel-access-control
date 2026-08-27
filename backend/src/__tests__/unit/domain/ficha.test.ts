import { describe, it, expect } from 'vitest';
import { Ficha } from '@/domain/value-objects/Ficha';

describe('Ficha Value Object', () => {
  describe('constructor', () => {
    it('debería aceptar un número de ficha válido', () => {
      const ficha = new Ficha(5, new Date('2026-08-27'));
      expect(ficha.getNumero()).toBe(5);
    });

    it('debería rechazar número de ficha menor a 1', () => {
      expect(() => new Ficha(0)).toThrow();
    });

    it('debería usar la fecha actual por defecto', () => {
      const antes = new Date();
      const ficha = new Ficha(1);
      const despues = new Date();

      expect(ficha.getFecha().getTime()).toBeGreaterThanOrEqual(antes.getTime());
      expect(ficha.getFecha().getTime()).toBeLessThanOrEqual(despues.getTime());
    });
  });

  describe('toString', () => {
    it('debería formatear como numero-DD/MM/YYYY', () => {
      const ficha = new Ficha(3, new Date(2026, 7, 27)); // agosto = mes 7 (0-indexed)
      expect(ficha.toString()).toBe('3-27/08/2026');
    });

    it('debería rellenar con cero día y mes de un solo dígito', () => {
      const ficha = new Ficha(1, new Date(2026, 0, 5)); // 5 de enero
      expect(ficha.toString()).toBe('1-05/01/2026');
    });
  });
});
