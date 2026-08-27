import { Request, Response } from 'express';
import { UnidadRepository } from '@/infrastructure/database/UnidadRepository';

export class UnitsController {
  private unidadRepo = new UnidadRepository();

  async tree(req: Request, res: Response) {
    const unidades = await this.unidadRepo.findByArbol();
    res.status(200).json({ unidades });
  }
}
