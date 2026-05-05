import express from 'express';
import prestamosController from '../controllers/prestamosController';

const router = express.Router();

router.get('/', prestamosController.listar);
router.get('/vencidos', prestamosController.verVencidos);
router.get('/vencidos/contar', prestamosController.contarVencidos);
router.get('/:id', prestamosController.obtener);
router.get('/:id/cronograma', prestamosController.verCronograma);
router.post('/', prestamosController.crear);

export default router;
