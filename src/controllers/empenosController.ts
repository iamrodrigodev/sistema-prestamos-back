import { Request, Response } from 'express';
import { EmpenoService } from '../services/EmpenoService';
import { tryCatch } from '../utils/tryCatch';

class EmpenoController {
  listar = tryCatch(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.q as string) || '';

    const data = await EmpenoService.getAll(page, limit, search);

    res.status(200).json({
      success: true,
      data,
    });
  });

  obtener = tryCatch(async (req: Request, res: Response) => {
    const { id } = req.params;
    const empeno = await EmpenoService.getById(parseInt(id as string));

    res.status(200).json({
      success: true,
      data: empeno,
    });
  });

  crear = tryCatch(async (req: Request, res: Response) => {
    const { cliente_id, nombre_articulo, descripcion, monto_prestado, valor_tasacion, fecha_limite } = req.body;
    const imagen = req.file ? req.file.filename : undefined;
    const usuario_id = (req as any).user.id;

    const empeno = await EmpenoService.create({
      cliente_id: parseInt(cliente_id),
      nombre_articulo,
      descripcion,
      valor_tasacion: parseFloat(valor_tasacion),
      monto_prestado: parseFloat(monto_prestado),
      fecha_limite: new Date(fecha_limite),
      imagen,
    }, usuario_id);

    res.status(201).json({
      success: true,
      message: 'Empeño registrado correctamente',
      data: empeno,
    });
  });

  cambiarEstado = tryCatch(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { estado } = req.body;
    const usuario_id = (req as any).user.id;

    const empeno = await EmpenoService.updateStatus(parseInt(id as string), estado, usuario_id);

    res.status(200).json({
      success: true,
      message: 'Estado del empeño actualizado',
      data: empeno,
    });
  });

  eliminar = tryCatch(async (req: Request, res: Response) => {
    const { id } = req.params;
    const usuario_id = (req as any).user.id;
    await EmpenoService.delete(parseInt(id as string), usuario_id);

    res.status(200).json({
      success: true,
      message: 'Empeño eliminado correctamente',
    });
  });
}

export default new EmpenoController();

