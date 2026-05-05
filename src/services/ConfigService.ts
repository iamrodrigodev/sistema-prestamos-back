import { AppDataSource } from '../config/data-source';
import { Configuracion } from '../entities/Configuracion';
import { ApiError } from '../utils/ApiError';

export class ConfigService {
  private static repository = AppDataSource.getRepository(Configuracion);

  static async get() {
    const config = await this.repository.findOne({ where: { id: 1 } });
    if (!config) {
      throw new ApiError(404, 'Configuración no encontrada');
    }
    return config;
  }

  static async update(data: Partial<Configuracion>) {
    const config = await this.get();
    this.repository.merge(config, data);
    return await this.repository.save(config);
  }
}
