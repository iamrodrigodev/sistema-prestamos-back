import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { tryCatch } from '../utils/tryCatch';

class AuthController {
  login = tryCatch(async (req: Request, res: Response) => {
    const { usuario: usuarioNombre, password } = req.body;
    const usuario = await AuthService.login(usuarioNombre, password);

    // Guardar en sesión
    req.session.usuarioId = usuario.id;
    req.session.rol = usuario.rol;

    res.status(200).json({
      success: true,
      message: 'Login exitoso',
      data: usuario,
    });
  });

  logout = tryCatch(async (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error al cerrar sesión' });
      }
      res.clearCookie('connect.sid');
      res.status(200).json({
        success: true,
        message: 'Sesión cerrada correctamente',
      });
    });
  });

  me = tryCatch(async (req: Request, res: Response) => {
    const usuario = (req as any).user;
    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'No autenticado',
      });
    }

    res.status(200).json({
      success: true,
      data: usuario,
    });
  });
}

export default new AuthController();

