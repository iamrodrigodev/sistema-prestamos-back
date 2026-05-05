import express from 'express';
import perfilController from '../controllers/perfilController';
import { auth } from '../middleware/auth';
import upload from '../middleware/upload';

const router = express.Router();

router.get('/', auth, perfilController.obtener);
router.put('/', auth, upload.single('foto'), perfilController.actualizar);
router.post('/password', auth, perfilController.cambiarPassword);

export default router;
