import express from 'express';
import bitacoraController from '../controllers/bitacoraController';

const router = express.Router();

router.get('/', bitacoraController.listar);

export default router;
