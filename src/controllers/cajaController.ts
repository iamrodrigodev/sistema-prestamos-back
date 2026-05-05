import { Request, Response } from 'express';
import { CajaService } from '../services/CajaService';
import { tryCatch } from '../utils/tryCatch';

class CajaController {
  obtenerResumen = tryCatch(async (req: Request, res: Response) => {
    const fecha = (req.query.fecha as string) || new Date().toISOString().split('T')[0];
    const resumen = await CajaService.getResumen(fecha);

    res.status(200).json({
      success: true,
      data: resumen,
    });
  });
}

export default new CajaController();

