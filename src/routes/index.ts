import { Router } from 'express';
import authRoutes from './auth';
import clientesRoutes from './clientes';
import prestamosRoutes from './prestamos';
import pagosRoutes from './pagos';
import empenosRoutes from './empenos';
import ahorrosRoutes from './ahorros';
import usuariosRoutes from './usuarios';
import reportesRoutes from './reportes';
import configRoutes from './config';
import perfilRoutes from './perfil';
import gastosRoutes from './gastos';
import cajaRoutes from './caja';
import backupRoutes from './backup';
import bitacoraRoutes from './bitacora';
import simuladorRoutes from './simulador';
import { auth, isAdmin } from '../middleware/auth';

const router = Router();

// Rutas públicas o de autenticación
router.use('/auth', authRoutes);

// Rutas protegidas por autenticación
router.use('/clientes', auth, clientesRoutes);
router.use('/prestamos', auth, prestamosRoutes);
router.use('/pagos', auth, pagosRoutes);
router.use('/empenos', auth, empenosRoutes);
router.use('/ahorros', auth, ahorrosRoutes);
router.use('/perfil', auth, perfilRoutes);
router.use('/gastos', auth, gastosRoutes);
router.use('/caja', auth, cajaRoutes);
router.use('/simulador', auth, simuladorRoutes);
router.use('/reportes', auth, reportesRoutes);

// Rutas exclusivas para administradores
router.use('/usuarios', auth, isAdmin, usuariosRoutes);
router.use('/config', auth, isAdmin, configRoutes);
router.use('/backup', auth, isAdmin, backupRoutes);
router.use('/bitacora', auth, isAdmin, bitacoraRoutes);

export default router;
