import { describe, it, expect } from 'vitest';
import { Dominio } from '@/domain/value-objects/Dominio';
import { ValidationException } from '@/domain/errors/ValidationException';

describe('Dominio Value Object', () => {
  describe('constructor', () => {
    it('debería aceptar formato clásico AAA123', () => {
      const dominio = new Dominio('aaa123');
      expect(dominio.getValue()).toBe('AAA123');
    });

    it('debería aceptar formato mercosur AB123CD', () => {
      const dominio = new Dominio('ab123cd');
      expect(dominio.getValue()).toBe('AB123CD');
    });

    it('debería normalizar a mayúsculas y quitar espacios', () => {
      const dominio = new Dominio(' aaa 123 ');
      expect(dominio.getValue()).toBe('AAA123');
    });

    it('debería rechazar formato inválido', () => {
      expect(() => new Dominio('123456')).toThrow(ValidationException);
    });

    it('debería rechazar string vacío', () => {
      expect(() => new Dominio('')).toThrow(ValidationException);
    });
  });

  describe('equals', () => {
    it('dos dominios normalizados iguales deberían ser iguales', () => {
      const d1 = new Dominio('aaa123');
      const d2 = new Dominio('AAA123');
      expect(d1.equals(d2)).toBe(true);
    });

    it('dos dominios distintos no deberían ser iguales', () => {
      const d1 = new Dominio('AAA123');
      const d2 = new Dominio('BBB456');
      expect(d1.equals(d2)).toBe(false);
    });
  });
});
