import { Request, Response } from 'express';
import { ClienteService } from '../services/ClienteService';
import { tryCatch } from '../utils/tryCatch';

class ClienteController {
  listar = tryCatch(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.q as string) || '';

    const data = await ClienteService.getAll(page, limit, search);

    res.status(200).json({
      success: true,
      data,
    });
  });

  obtener = tryCatch(async (req: Request, res: Response) => {
    const { id } = req.params;
    const cliente = await ClienteService.getById(parseInt(id as string));

    res.status(200).json({
      success: true,
      data: cliente,
    });
  });

  crear = tryCatch(async (req: Request, res: Response) => {
    const { dni, nombre, apellido, telefono, direccion, email } = req.body;
    const foto = req.file ? req.file.filename : undefined;
    const usuario_id = (req as any).user.id;

    const cliente = await ClienteService.create({
      dni,
      nombre,
      apellido,
      telefono,
      direccion,
      email,
      foto,
    }, usuario_id);

    res.status(201).json({
      success: true,
      message: 'Cliente creado correctamente',
      data: cliente,
    });
  });

  actualizar = tryCatch(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { dni, nombre, apellido, telefono, direccion, email } = req.body;
    const foto = req.file ? req.file.filename : undefined;
    const usuario_id = (req as any).user.id;

    const dataToUpdate: any = { dni, nombre, apellido, telefono, direccion, email };
    if (foto) dataToUpdate.foto = foto;

    const cliente = await ClienteService.update(parseInt(id as string), dataToUpdate, usuario_id);

    res.status(200).json({
      success: true,
      message: 'Cliente actualizado correctamente',
      data: cliente,
    });
  });

  eliminar = tryCatch(async (req: Request, res: Response) => {
    const { id } = req.params;
    const usuario_id = (req as any).user.id;
    await ClienteService.delete(parseInt(id as string), usuario_id);

    res.status(200).json({
      success: true,
      message: 'Cliente eliminado correctamente',
    });
  });
}

export default new ClienteController();

