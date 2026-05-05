import { Request, Response } from 'express';
import { GastoService } from '../services/GastoService';
import { tryCatch } from '../utils/tryCatch';

class GastoController {
  listar = tryCatch(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.q as string) || '';

    const data = await GastoService.getAll(page, limit, search);

    res.status(200).json({
      success: true,
      data,
    });
  });

  crear = tryCatch(async (req: Request, res: Response) => {
    const { descripcion, monto, categoria, fecha_gasto, observacion } = req.body;
    const usuarioId = (req as any).user.id;

    const gasto = await GastoService.create({
      descripcion,
      monto: parseFloat(monto),
      categoria,
      fecha_gasto: new Date(fecha_gasto),
      observacion,
      registrado_por: (req as any).user.nombre
    }, usuarioId);

    res.status(201).json({
      success: true,
      message: 'Gasto registrado correctamente',
      data: gasto,
    });
  });

  eliminar = tryCatch(async (req: Request, res: Response) => {
    const { id } = req.params;
    const usuarioId = (req as any).user?.id || 0;

    await GastoService.delete(parseInt(id as string), usuarioId);

    res.status(200).json({
      success: true,
      message: 'Gasto eliminado correctamente',
    });
  });
}

export default new GastoController();

