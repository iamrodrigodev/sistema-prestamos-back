import express from 'express';
import usuariosController from '../controllers/usuariosController';
import upload from '../middleware/upload';
// Por ahora usamos el middleware que ya existe o lo adaptaremos
// import { isAdmin } from '../middleware/auth'; 

const router = express.Router();

// Listar usuarios
router.get('/', usuariosController.listar);

// Obtener un usuario específico
router.get('/:id', usuariosController.obtener);

// Crear un nuevo usuario
router.post('/', upload.single('foto'), usuariosController.crear);

// Actualizar un usuario existente
router.put('/:id', upload.single('foto'), usuariosController.actualizar);

// Eliminar un usuario
router.delete('/:id', usuariosController.eliminar);

export default router;
