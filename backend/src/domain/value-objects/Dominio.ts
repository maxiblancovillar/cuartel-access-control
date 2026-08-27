import { ValidationException } from '../errors/ValidationException';

export class Dominio {
  private readonly value: string;

  constructor(dominio: string) {
    const normalized = dominio.toUpperCase().replace(/\s/g, '');

    // Validar formato: AAA123 o ABC1234 o AB123CD
    if (!/^[A-Z]{1,3}\d{1,4}[A-Z]*$/.test(normalized)) {
      throw new ValidationException({
        dominio: ['Formato de dominio inválido. Ejemplo: AAA123'],
      });
    }

    this.value = normalized;
  }

  getValue(): string {
    return this.value;
  }

  equals(other: Dominio): boolean {
    return this.value === other.value;
  }
}
