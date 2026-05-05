import { Request, Response, NextFunction } from 'express';

export const auth = (req: Request, res: Response, next: NextFunction) => {
  if ((req as any).user) {
    return next();
  }

  return res.status(401).json({
    success: false,
    message: 'No autenticado. Por favor, inicie sesión.',
  });
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  if (user && user.rol === 'admin') {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Acceso denegado. Se requieren permisos de administrador.',
  });
};

export default { auth, isAdmin };
