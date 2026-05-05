import { AppDataSource } from '../config/data-source';
import { Cliente } from '../entities/Cliente';
import { ApiError } from '../utils/ApiError';
import { BitacoraService } from './BitacoraService';

export class ClienteService {
  private static repository = AppDataSource.getRepository(Cliente);

  static async getAll(page = 1, limit = 10, search = '') {
    const query = this.repository.createQueryBuilder('cliente');

    if (search) {
      query.where('cliente.nombre LIKE :search OR cliente.apellido LIKE :search OR cliente.dni LIKE :search', {
        search: `%${search}%`,
      });
    }

    const [items, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('cliente.created_at', 'DESC')
      .getManyAndCount();

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getById(id: number) {
    const cliente = await this.repository.findOne({ where: { id } });
    if (!cliente) {
      throw new ApiError(404, 'Cliente no encontrado');
    }
    return cliente;
  }

  static async create(data: Partial<Cliente>, usuario_id: number) {
    const existing = await this.repository.findOne({ where: { dni: data.dni } });
    if (existing) {
      throw new ApiError(400, 'Ya existe un cliente con ese DNI');
    }

    const nuevoCliente = this.repository.create(data);
    const guardado = await this.repository.save(nuevoCliente);

    await BitacoraService.register(usuario_id, 'NUEVO_CLIENTE', `Cliente ${data.nombre} ${data.apellido} (DNI: ${data.dni}) creado`);

    return guardado;
  }

  static async update(id: number, data: Partial<Cliente>, usuario_id: number) {
    const cliente = await this.getById(id);
    this.repository.merge(cliente, data);
    const actualizado = await this.repository.save(cliente);

    await BitacoraService.register(usuario_id, 'ACTUALIZAR_CLIENTE', `Cliente ID ${id} actualizado`);

    return actualizado;
  }

  static async delete(id: number, usuario_id: number) {
    const cliente = await this.getById(id);
    await this.repository.remove(cliente);

    await BitacoraService.register(usuario_id, 'ELIMINAR_CLIENTE', `Cliente ID ${id} eliminado`);

    return true;
  }
}
