import { DomainException } from './DomainException';

export class ValidationException extends DomainException {
  constructor(public fieldErrors: Record<string, string[]>) {
    super('VALIDATION_ERROR', 'Errores de validación en los datos enviados', 400);
  }
}
