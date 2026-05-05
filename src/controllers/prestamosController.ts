import { Request, Response } from 'express';
import { PrestamoService } from '../services/PrestamoService';
import { tryCatch } from '../utils/tryCatch';

class PrestamoController {
  listar = tryCatch(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.q as string) || '';

    // Procesar vencimientos antes de listar
    await PrestamoService.processOverdue();

    const data = await PrestamoService.getAll(page, limit, search);

    res.status(200).json({
      success: true,
      data,
    });
  });

  obtener = tryCatch(async (req: Request, res: Response) => {
    const { id } = req.params;
    const prestamo = await PrestamoService.getById(parseInt(id as string));

    res.status(200).json({
      success: true,
      data: prestamo,
    });
  });

  crear = tryCatch(async (req: Request, res: Response) => {
    const { cliente_id, monto, interes, cuotas, frecuencia, fecha_inicio } = req.body;
    const usuario_id = (req as any).user.id;

    const prestamo = await PrestamoService.create(
      {
        cliente_id,
        monto,
        interes,
        cuotas,
        frecuencia,
        fecha_inicio,
      },
      usuario_id,
    );

    res.status(201).json({
      success: true,
      message: 'Préstamo registrado correctamente',
      data: prestamo,
    });
  });

  verVencidos = tryCatch(async (req: Request, res: Response) => {
    await PrestamoService.processOverdue();
    const vencidos = await PrestamoService.getOverdue();

    res.status(200).json({
      success: true,
      data: vencidos,
    });
  });

  verCronograma = tryCatch(async (req: Request, res: Response) => {
    const { id } = req.params;
    const cronograma = await PrestamoService.getSchedule(parseInt(id as string));

    res.status(200).json({
      success: true,
      data: cronograma,
    });
  });

  contarVencidos = tryCatch(async (req: Request, res: Response) => {
    const total = await PrestamoService.countOverdue();
    res.status(200).json({
      success: true,
      data: { total },
    });
  });
}

export default new PrestamoController();

