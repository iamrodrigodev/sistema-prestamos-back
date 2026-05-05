import { AppDataSource } from '../config/data-source';
import { Usuario } from '../entities/Usuario';
import { ApiError } from '../utils/ApiError';
import bcrypt from 'bcryptjs';

export class UsuarioService {
  private static repository = AppDataSource.getRepository(Usuario);

  static async getAll() {
    return await this.repository.find({
      select: ['id', 'nombre', 'usuario', 'rol', 'estado', 'foto', 'created_at'],
    });
  }

  static async getById(id: number) {
    const usuario = await this.repository.findOne({ where: { id } });
    if (!usuario) {
      throw new ApiError(404, 'Usuario no encontrado');
    }
    return usuario;
  }

  static async getByUsername(usuario: string) {
    return await this.repository.findOne({ where: { usuario } });
  }

  static async create(data: Partial<Usuario>) {
    const existing = await this.getByUsername(data.usuario!);
    if (existing) {
      throw new ApiError(400, 'El nombre de usuario ya está registrado');
    }

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    const nuevoUsuario = this.repository.create(data);
    return await this.repository.save(nuevoUsuario);
  }

  static async update(id: number, data: Partial<Usuario>) {
    const usuario = await this.getById(id);
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    this.repository.merge(usuario, data);
    return await this.repository.save(usuario);
  }

  static async delete(id: number) {
    const usuario = await this.getById(id);
    await this.repository.remove(usuario);
    return true;
  }
}
