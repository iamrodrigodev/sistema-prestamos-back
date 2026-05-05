import express from 'express';
import simuladorController from '../controllers/simuladorController';

const router = express.Router();

router.post('/calcular', simuladorController.calcular);

export default router;
