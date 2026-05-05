import express from 'express';
import cajaController from '../controllers/cajaController';

const router = express.Router();

router.get('/resumen', cajaController.obtenerResumen);

export default router;
