import express from 'express';
import pagosController from '../controllers/pagosController';

const router = express.Router();

router.get('/prestamo/:id_prestamo', pagosController.listarPorPrestamo);
router.post('/', pagosController.registrar);

export default router;
