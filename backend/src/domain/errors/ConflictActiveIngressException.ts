import { DomainException } from './DomainException';

export class ConflictActiveIngressException extends DomainException {
  constructor(dni: string) {
    super('CONFLICT_ACTIVE_INGRESS', `DNI ${dni} ya posee ingreso abierto`, 409);
  }
}
