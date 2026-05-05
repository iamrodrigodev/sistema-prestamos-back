import { Request, Response } from 'express';
import { UsuarioService } from '../services/UsuarioService';
import { tryCatch } from '../utils/tryCatch';
import { ApiError } from '../utils/ApiError';
import bcrypt from 'bcryptjs';

class PerfilController {
  obtener = tryCatch(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    if (!userId) throw new ApiError(401, 'No autorizado');

    const usuario = await UsuarioService.getByIdSafe(userId);
    res.status(200).json({
      success: true,
      data: usuario,
    });
  });

  actualizar = tryCatch(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    if (!userId) throw new ApiError(401, 'No autorizado');

    const { nombre, email } = req.body;
    const foto = req.file ? req.file.filename : undefined;

    const dataToUpdate: any = { nombre, email };
    if (foto) dataToUpdate.foto = foto;

    const usuario = await UsuarioService.update(userId, dataToUpdate);

    res.status(200).json({
      success: true,
      message: 'Perfil actualizado correctamente',
      data: usuario,
    });
  });

  cambiarPassword = tryCatch(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    if (!userId) throw new ApiError(401, 'No autorizado');

    const { password_actual, password_nueva, password_confirmar } = req.body;

    if (password_nueva !== password_confirmar) {
      throw new ApiError(400, 'Las nuevas contraseñas no coinciden');
    }

    const usuario = await UsuarioService.getById(userId);
    const esValido = await bcrypt.compare(password_actual, usuario.password);

    if (!esValido) {
      throw new ApiError(400, 'La contraseña actual es incorrecta');
    }

    const hashedNewPassword = await bcrypt.hash(password_nueva, 10);
    await UsuarioService.update(userId, { password: hashedNewPassword });

    res.status(200).json({
      success: true,
      message: 'Contraseña actualizada correctamente',
    });
  });
}

export default new PerfilController();

