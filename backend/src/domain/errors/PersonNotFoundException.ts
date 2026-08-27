import { DomainException } from './DomainException';

export class PersonNotFoundException extends DomainException {
  constructor(dni: string) {
    super('PERSON_NOT_FOUND', `No existe persona con DNI: ${dni}`, 404);
  }
}
