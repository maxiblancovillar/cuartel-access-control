import { ValidationException } from '../errors/ValidationException';

export class DNI {
  private readonly value: string;

  constructor(dni: string) {
    const cleaned = dni.replace(/\D/g, '');

    if (cleaned.length < 7 || cleaned.length > 8) {
      throw new ValidationException({
        dni: ['DNI debe tener 7-8 dígitos'],
      });
    }

    this.value = cleaned;
  }

  getValue(): string {
    return this.value;
  }

  equals(other: DNI): boolean {
    return this.value === other.value;
  }
}
