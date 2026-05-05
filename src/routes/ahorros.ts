import express from 'express';
import ahorrosController from '../controllers/ahorrosController';
import { auth } from '../middleware/auth';

const router = express.Router();

router.get('/', auth, ahorrosController.listar);
router.get('/:id', auth, ahorrosController.obtener);
router.post('/movimiento', auth, ahorrosController.registrarMovimiento);
router.post('/aperturar', auth, ahorrosController.crear);

export default router;
