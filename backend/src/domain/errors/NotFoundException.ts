import { DomainException } from './DomainException';

export class NotFoundException extends DomainException {
  constructor(recurso: string, id: string) {
    super('NOT_FOUND', `No existe ${recurso} con id: ${id}`, 404);
  }
}
