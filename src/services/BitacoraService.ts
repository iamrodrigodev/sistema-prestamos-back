import { AppDataSource } from '../config/data-source';
import { Bitacora } from '../entities/Bitacora';

export class BitacoraService {
  private static repository = AppDataSource.getRepository(Bitacora);

  static async getAll(page = 1, limit = 10) {
    const [items, total] = await this.repository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { fecha: 'DESC' },
    });

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async register(usuario_id: number, accion: string, detalle: string) {
    const log = this.repository.create({
      usuario_id,
      accion,
      detalle,
    });
    return await this.repository.save(log);
  }
}
