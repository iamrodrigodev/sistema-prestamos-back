import express from 'express';
import authController from '../controllers/authController';

const router = express.Router();

// Procesar Login
router.post('/login', authController.login);

// Cerrar Sesión
router.post('/logout', authController.logout);

// Obtener usuario actual
router.get('/me', authController.me);

export default router;
