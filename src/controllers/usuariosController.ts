import { Request, Response } from 'express';
import { UsuarioService } from '../services/UsuarioService';
import { tryCatch } from '../utils/tryCatch';

class UsuariosController {
  listar = tryCatch(async (req: Request, res: Response) => {
    const usuarios = await UsuarioService.getAll();
    res.status(200).json({
      success: true,
      data: usuarios,
    });
  });

  obtener = tryCatch(async (req: Request, res: Response) => {
    const { id } = req.params;
    const usuario = await UsuarioService.getById(parseInt(id as string));
    res.status(200).json({
      success: true,
      data: usuario,
    });
  });

  crear = tryCatch(async (req: Request, res: Response) => {
    const { nombre, usuario, password, rol } = req.body;
    const foto = req.file ? req.file.filename : undefined;

    const nuevoUsuario = await UsuarioService.create({
      nombre,
      usuario,
      password,
      rol,
      foto,
      estado: 1,
    });

    res.status(201).json({
      success: true,
      message: 'Usuario creado correctamente',
      data: nuevoUsuario,
    });
  });

  actualizar = tryCatch(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { nombre, usuario, rol, estado } = req.body;
    const foto = req.file ? req.file.filename : undefined;

    const dataToUpdate: any = { nombre, usuario, rol, estado: parseInt(estado) };
    if (foto) dataToUpdate.foto = foto;

    const usuarioActualizado = await UsuarioService.update(parseInt(id as string), dataToUpdate);

    res.status(200).json({
      success: true,
      message: 'Usuario actualizado correctamente',
      data: usuarioActualizado,
    });
  });

  eliminar = tryCatch(async (req: Request, res: Response) => {
    const { id } = req.params;
    await UsuarioService.delete(parseInt(id as string));

    res.status(200).json({
      success: true,
      message: 'Usuario eliminado correctamente',
    });
  });
}

export default new UsuariosController();
