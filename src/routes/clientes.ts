import express from 'express';
import clientesController from '../controllers/clientesController';
import upload from '../middleware/upload';

const router = express.Router();

// Listar clientes con paginación y búsqueda
router.get('/', clientesController.listar);

// Obtener un cliente específico
router.get('/:id', clientesController.obtener);

// Crear un nuevo cliente (con subida de foto)
router.post('/', upload.single('foto'), clientesController.crear);

// Actualizar un cliente existente
router.put('/:id', upload.single('foto'), clientesController.actualizar);

// Eliminar un cliente
router.delete('/:id', clientesController.eliminar);

export default router;
