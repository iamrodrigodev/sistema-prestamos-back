import { Request, Response } from 'express';
import { BitacoraService } from '../services/BitacoraService';
import { tryCatch } from '../utils/tryCatch';

class BitacoraController {
  listar = tryCatch(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const data = await BitacoraService.getAll(page, limit);

    res.status(200).json({
      success: true,
      data,
    });
  });
}

export default new BitacoraController();

