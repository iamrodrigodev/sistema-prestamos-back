import { AppDataSource } from '../config/data-source';
import { Empeno } from '../entities/Empeno';
import { ApiError } from '../utils/ApiError';
import { BitacoraService } from './BitacoraService';

export class EmpenoService {
  private static repository = AppDataSource.getRepository(Empeno);

  static async getAll(page = 1, limit = 10, search = '') {
    const query = this.repository.createQueryBuilder('empeno')
      .leftJoinAndSelect('empeno.cliente', 'cliente');

    if (search) {
      query.where('empeno.nombre_articulo LIKE :search OR cliente.nombre LIKE :search OR cliente.apellido LIKE :search', {
        search: `%${search}%`,
      });
    }

    const [items, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('empeno.created_at', 'DESC')
      .getManyAndCount();

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getById(id: number) {
    const empeno = await this.repository.findOne({
      where: { id },
      relations: ['cliente'],
    });

    if (!empeno) {
      throw new ApiError(404, 'Empeño no encontrado');
    }

    return empeno;
  }

  static async create(data: Partial<Empeno>, usuario_id: number) {
    const nuevoEmpeno = this.repository.create(data);
    const guardado = await this.repository.save(nuevoEmpeno);

    await BitacoraService.register(
      usuario_id,
      'NUEVO_EMPEÑO',
      `Artículo ${data.nombre_articulo} empeñado por cliente #${data.cliente_id}`
    );

    return guardado;
  }

  static async updateStatus(id: number, estado: 'en_custodia' | 'retirado' | 'perdido' | 'vendido', usuario_id: number) {
    const empeno = await this.getById(id);
    const estadoAnterior = empeno.estado;
    empeno.estado = estado;
    const actualizado = await this.repository.save(empeno);

    await BitacoraService.register(
      usuario_id,
      'ACTUALIZAR_EMPEÑO',
      `Estado de empeño #${id} cambiado de ${estadoAnterior} a ${estado}`
    );

    return actualizado;
  }

  static async delete(id: number, usuario_id: number) {
    const empeno = await this.getById(id);
    await this.repository.remove(empeno);

    await BitacoraService.register(usuario_id, 'ELIMINAR_EMPEÑO', `Empeño #${id} eliminado`);

    return true;
  }
}
