import express, { Request, Response, NextFunction } from 'express';
const router = express.Router();
import backupController from '../controllers/backupController';

// Middleware: Solo Admin
const esAdmin = (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (user && user.rol === 'admin') {
        return next();
    }
    return res.status(403).json({
        success: false,
        message: 'Acceso denegado. Se requieren permisos de administrador.'
    });
};

// Ruta de descarga
router.get('/descargar', esAdmin, backupController.descargar);

export default router;
