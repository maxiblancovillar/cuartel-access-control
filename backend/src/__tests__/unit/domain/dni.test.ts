import { describe, it, expect } from 'vitest';
import { DNI } from '@/domain/value-objects/DNI';
import { ValidationException } from '@/domain/errors/ValidationException';

describe('DNI Value Object', () => {
  describe('constructor', () => {
    it('debería aceptar DNI de 8 dígitos', () => {
      const dni = new DNI('38123456');
      expect(dni.getValue()).toBe('38123456');
    });

    it('debería aceptar DNI de 7 dígitos', () => {
      const dni = new DNI('1234567');
      expect(dni.getValue()).toBe('1234567');
    });

    it('debería limpiar caracteres no numéricos (puntos)', () => {
      const dni = new DNI('38.123.456');
      expect(dni.getValue()).toBe('38123456');
    });

    it('debería rechazar DNI con menos de 7 dígitos', () => {
      expect(() => new DNI('123456')).toThrow(ValidationException);
    });

    it('debería rechazar DNI con más de 8 dígitos', () => {
      expect(() => new DNI('381234567')).toThrow(ValidationException);
    });

    it('debería rechazar DNI vacío o no numérico', () => {
      expect(() => new DNI('ABCDEFG')).toThrow(ValidationException);
    });
  });

  describe('equals', () => {
    it('dos DNI con el mismo valor deberían ser iguales', () => {
      const dni1 = new DNI('38123456');
      const dni2 = new DNI('38123456');
      expect(dni1.equals(dni2)).toBe(true);
    });

    it('dos DNI con valores distintos no deberían ser iguales', () => {
      const dni1 = new DNI('38123456');
      const dni2 = new DNI('42987654');
      expect(dni1.equals(dni2)).toBe(false);
    });
  });
});
