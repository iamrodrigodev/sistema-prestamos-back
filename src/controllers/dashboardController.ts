import { Request, Response } from 'express';
import { DashboardService } from '../services/DashboardService';
import { tryCatch } from '../utils/tryCatch';

class DashboardController {
  obtenerDatos = tryCatch(async (req: Request, res: Response) => {
    const data = await DashboardService.getFullDashboard();

    res.status(200).json({
      success: true,
      data,
    });
  });
}

export default new DashboardController();
