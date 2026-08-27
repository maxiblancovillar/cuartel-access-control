import { Request, Response } from 'express';
import { ReportsService } from '@/application/services/ReportsService';

export class ReportsController {
  private reportsService = new ReportsService();

  async getRegistros(req: Request, res: Response) {
    const { fechaInicio, fechaFin, tipoPersona, unidadId } = req.query;

    const registros = await this.reportsService.getRegistros({
      fechaInicio: fechaInicio as string | undefined,
      fechaFin: fechaFin as string | undefined,
      tipoPersona: tipoPersona as string | undefined,
      unidadId: unidadId ? parseInt(unidadId as string, 10) : undefined,
    });

    res.status(200).json(registros);
  }

  async getStats(req: Request, res: Response) {
    const stats = await this.reportsService.getStats();
    res.status(200).json(stats);
  }
}
