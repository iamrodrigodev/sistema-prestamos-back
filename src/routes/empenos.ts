import express from 'express';
import empenosController from '../controllers/empenosController';
import { auth } from '../middleware/auth';
import upload from '../middleware/upload';

const router = express.Router();

router.get('/', auth, empenosController.listar);
router.get('/:id', auth, empenosController.obtener);
router.post('/', auth, upload.single('imagen'), empenosController.crear);
router.patch('/:id/estado', auth, empenosController.cambiarEstado);
router.delete('/:id', auth, empenosController.eliminar);

export default router;
