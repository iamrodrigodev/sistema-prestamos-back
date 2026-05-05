import { Request, Response } from 'express';
import { AhorroService } from '../services/AhorroService';
import { tryCatch } from '../utils/tryCatch';

class AhorroController {
  listar = tryCatch(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const data = await AhorroService.getAll(page, limit);

    res.status(200).json({
      success: true,
      data,
    });
  });

  obtener = tryCatch(async (req: Request, res: Response) => {
    const { id } = req.params;
    const cuenta = await AhorroService.getById(parseInt(id as string));

    res.status(200).json({
      success: true,
      data: cuenta,
    });
  });

  crear = tryCatch(async (req: Request, res: Response) => {
    const { cliente_id } = req.body;
    const usuario_id = (req as any).user.id;
    const cuenta = await AhorroService.create(parseInt(cliente_id), usuario_id);

    res.status(201).json({
      success: true,
      message: 'Cuenta aperturada correctamente',
      data: cuenta,
    });
  });

  registrarMovimiento = tryCatch(async (req: Request, res: Response) => {
    const { cuenta_id, tipo, monto, observacion } = req.body;
    const usuario_id = (req as any).user.id;

    const movimiento = await AhorroService.addMovement(
      parseInt(cuenta_id),
      tipo,
      parseFloat(monto),
      usuario_id,
      observacion
    );

    res.status(200).json({
      success: true,
      message: 'Movimiento registrado con éxito',
      data: movimiento,
    });
  });
}

export default new AhorroController();

