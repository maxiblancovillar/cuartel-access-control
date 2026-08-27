import { Request, Response } from 'express';
import { DashboardService } from '@/application/services/DashboardService';

export class DashboardController {
  private dashboardService = new DashboardService();

  async situacionActual(req: Request, res: Response) {
    const situacion = await this.dashboardService.obtenerSituacionActual();
    res.status(200).json(situacion);
  }
}
