import { AppDataSource } from '../config/data-source';
import { Prestamo } from '../entities/Prestamo';
import { ApiError } from '../utils/ApiError';
import finance from '../utils/finance';
import { BitacoraService } from './BitacoraService';

export class PrestamoService {
  private static repository = AppDataSource.getRepository(Prestamo);

  static async getAll(page = 1, limit = 10, search = '') {
    const query = this.repository
      .createQueryBuilder('prestamo')
      .innerJoinAndSelect('prestamo.cliente', 'cliente');

    if (search) {
      query.where(
        'cliente.nombre LIKE :search OR cliente.apellido LIKE :search OR prestamo.id LIKE :search',
        {
          search: `%${search}%`,
        },
      );
    }

    const [items, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('prestamo.fecha_inicio', 'DESC')
      .getManyAndCount();

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getById(id: number) {
    const prestamo = await this.repository.findOne({
      where: { id },
      relations: ['cliente', 'pagos'],
    });
    if (!prestamo) {
      throw new ApiError(404, 'Préstamo no encontrado');
    }
    return prestamo;
  }

  static async create(
    data: {
      cliente_id: number;
      monto: number;
      interes: number;
      cuotas: number;
      frecuencia: 'diario' | 'semanal' | 'quincenal' | 'mensual';
      fecha_inicio: string;
    },
    usuario_id: number,
  ) {
    return await AppDataSource.transaction(async (transactionalEntityManager) => {
      const { cliente_id, monto, interes, cuotas, frecuencia, fecha_inicio } = data;

      const montoPrestado = parseFloat(monto.toString());
      const tasa = parseFloat(interes.toString());
      const numCuotas = parseInt(cuotas.toString());

      const montoInteres = montoPrestado * (tasa / 100);
      const montoTotal = montoPrestado + montoInteres;

      // Calcular fecha_fin usando la utilidad finance para consistencia
      let fechaFin = new Date(fecha_inicio);
      for (let i = 0; i < numCuotas; i++) {
        fechaFin = finance.sumarFecha(fechaFin, frecuencia);
      }

      const nuevoPrestamo = this.repository.create({
        cliente_id,
        monto_prestado: montoPrestado,
        tasa_interes: tasa,
        monto_total: montoTotal,
        cuotas: numCuotas,
        frecuencia,
        fecha_inicio: new Date(fecha_inicio),
        fecha_fin: fechaFin,
        estado: 'pendiente',
      });

      const prestamoGuardado = await transactionalEntityManager.save(nuevoPrestamo);

      // Registro en Bitácora
      await BitacoraService.register(
        usuario_id,
        'NUEVO_PRESTAMO',
        `Préstamo #${prestamoGuardado.id} creado para cliente #${cliente_id} por un total de ${montoTotal}`,
      );

      return prestamoGuardado;
    });
  }

  static async processOverdue() {
    await this.repository
      .createQueryBuilder()
      .update(Prestamo)
      .set({ estado: 'vencido' })
      .where('fecha_fin < :today AND estado = :status', {
        today: new Date(),
        status: 'pendiente',
      })
      .execute();
  }

  static async countOverdue() {
    return await this.repository.count({ where: { estado: 'vencido' } });
  }

  static async getOverdue() {
    return await this.repository.find({
      where: { estado: 'vencido' },
      relations: ['cliente'],
      order: { fecha_fin: 'ASC' },
    });
  }

  static async getSchedule(id: number) {
    const prestamo = await this.getById(id);
    return finance.calcularCronograma(
      parseFloat(prestamo.monto_total.toString()),
      prestamo.cuotas,
      prestamo.frecuencia,
      prestamo.fecha_inicio,
    );
  }
}
