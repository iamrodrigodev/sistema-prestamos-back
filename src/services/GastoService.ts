import { AppDataSource } from '../config/data-source';
import { Gasto } from '../entities/Gasto';
import { ApiError } from '../utils/ApiError';
import { BitacoraService } from './BitacoraService';

export class GastoService {
  private static repository = AppDataSource.getRepository(Gasto);

  static async getAll(page = 1, limit = 10, search = '') {
    const query = this.repository.createQueryBuilder('gasto')
      .leftJoinAndSelect('gasto.usuario', 'usuario');

    if (search) {
      query.where('gasto.descripcion LIKE :search', {
        search: `%${search}%`,
      });
    }

    const [items, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('gasto.fecha_gasto', 'DESC') // Usar fecha_gasto según db.sql y entidad
      .getManyAndCount();

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getById(id: number) {
    const gasto = await this.repository.findOne({
      where: { id },
      relations: ['usuario'],
    });

    if (!gasto) {
      throw new ApiError(404, 'Gasto no encontrado');
    }

    return gasto;
  }

  static async create(data: Partial<Gasto>, usuarioId: number) {
    const nuevoGasto = this.repository.create({
        ...data,
        usuario_id: usuarioId
    });
    const saved = await this.repository.save(nuevoGasto);

    // Registrar en bitácora
    await BitacoraService.register(
      usuarioId,
      'REGISTRAR_GASTO',
      `Se registró gasto: ${saved.descripcion} por un monto de ${saved.monto}`
    );

    return saved;
  }

  static async delete(id: number, usuarioId: number) {
    const gasto = await this.getById(id);
    await this.repository.remove(gasto);

    await BitacoraService.register(
      usuarioId,
      'ELIMINAR_GASTO',
      `Se eliminó el gasto con ID: ${id} (${gasto.descripcion})`
    );

    return true;
  }
}
