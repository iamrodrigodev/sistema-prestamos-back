import express from 'express';
import gastosController from '../controllers/gastosController';
import { auth } from '../middleware/auth';

const router = express.Router();

router.get('/', auth, gastosController.listar);
router.post('/', auth, gastosController.crear);
router.delete('/:id', auth, gastosController.eliminar);

export default router;
