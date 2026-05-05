import { AppDataSource } from '../config/data-source';
import { Usuario } from '../entities/Usuario';
import { ApiError } from '../utils/ApiError';
import bcrypt from 'bcryptjs';
import { BitacoraService } from './BitacoraService';

export class UsuarioService {
  private static repository = AppDataSource.getRepository(Usuario);

  static async getAll() {
    return await this.repository.find({
      select: ['id', 'nombre', 'usuario', 'rol', 'estado', 'foto', 'created_at'],
    });
  }

  static async getById(id: number) {
    const usuario = await this.repository.findOne({
      where: { id },
    });
    if (!usuario) {
      throw new ApiError(404, 'Usuario no encontrado');
    }
    return usuario;
  }

  static async getByIdSafe(id: number) {
    const usuario = await this.repository.findOne({
      where: { id },
      select: ['id', 'nombre', 'usuario', 'rol', 'estado', 'foto', 'created_at'],
    });
    if (!usuario) {
      throw new ApiError(404, 'Usuario no encontrado');
    }
    return usuario;
  }

  static async getByUsername(usuario: string) {
    return await this.repository.findOne({ where: { usuario } });
  }

  static async create(data: Partial<Usuario>, usuarioId: number) {
    const existing = await this.getByUsername(data.usuario!);
    if (existing) {
      throw new ApiError(400, 'El nombre de usuario ya está registrado');
    }

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    const nuevoUsuario = this.repository.create(data);
    const guardado = await this.repository.save(nuevoUsuario);

    await BitacoraService.register(usuarioId, 'CREAR_USUARIO', `Usuario ${data.usuario} creado con rol ${data.rol}`);

    return guardado;
  }

  static async update(id: number, data: Partial<Usuario>, usuarioId: number) {
    const usuario = await this.getById(id);
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    this.repository.merge(usuario, data);
    const actualizado = await this.repository.save(usuario);

    await BitacoraService.register(usuarioId, 'ACTUALIZAR_USUARIO', `Usuario ID ${id} actualizado`);

    return actualizado;
  }

  static async delete(id: number, usuarioId: number) {
    const usuario = await this.getById(id);
    await this.repository.remove(usuario);

    await BitacoraService.register(usuarioId, 'ELIMINAR_USUARIO', `Usuario ID ${id} eliminado`);

    return true;
  }
}
