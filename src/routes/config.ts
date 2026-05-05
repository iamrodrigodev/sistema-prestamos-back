import express from 'express';
import configController from '../controllers/configController';
import upload from '../middleware/upload';

const router = express.Router();

router.get('/', configController.obtener);
router.put('/', upload.single('logo'), configController.actualizar);

export default router;
