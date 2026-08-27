import { PersonNotFoundException } from '@/domain/errors/PersonNotFoundException';
import { IPersonaRepository } from '@/domain/interfaces';

export class PersonService {
  constructor(private personaRepo: IPersonaRepository) {}

  async buscarPorDni(dni: string) {
    const persona = await this.personaRepo.findByDni(dni);
    if (!persona) {
      throw new PersonNotFoundException(dni);
    }
    return this.formatearRespuesta(persona);
  }

  async obtenerPorId(id: string) {
    const persona = await this.personaRepo.findById(id);
    if (!persona) {
      throw new PersonNotFoundException('Persona no encontrada');
    }
    return this.formatearRespuesta(persona);
  }

  private formatearRespuesta(persona: any) {
    return {
      id: persona.id,
      dni: persona.dni,
      nombre: persona.nombre,
      apellido: persona.apellido,
      tipoPersona: persona.tipoPersona,
      tipoDocumento: persona.tipoDocumento,
      ...(persona.militar && { militar: persona.militar }),
      ...(persona.civil && { civil: persona.civil }),
    };
  }
}
