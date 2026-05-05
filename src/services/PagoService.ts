import { AppDataSource } from '../config/data-source';
import { Pago } from '../entities/Pago';
import { Prestamo } from '../entities/Prestamo';
import { ApiError } from '../utils/ApiError';
import { BitacoraService } from './BitacoraService';

export class PagoService {
  private static repository = AppDataSource.getRepository(Pago);
  private static prestamoRepository = AppDataSource.getRepository(Prestamo);

  static async getById(id: number) {
    const pago = await this.repository.findOne({
      where: { id },
      relations: ['prestamo', 'prestamo.cliente'],
    });
    if (!pago) {
      throw new ApiError(404, 'Pago no encontrado');
    }
    return pago;
  }

  static async getByPrestamo(prestamoId: number) {
    return await this.repository.find({
      where: { prestamo_id: prestamoId },
      order: { nro_cuota: 'ASC' },
    });
  }

  static async getTotalPagado(prestamoId: number) {
    const result = await this.repository
      .createQueryBuilder('pago')
      .select('SUM(pago.monto)', 'total')
      .where('pago.prestamo_id = :prestamoId', { prestamoId })
      .getRawOne();
    return parseFloat(result.total || '0');
  }

  static async create(
    data: {
      prestamo_id: number;
      monto: number;
      metodo_pago: string;
      nro_cuota: number;
    },
    usuario_id: number,
  ) {
    return await AppDataSource.transaction(async (transactionalEntityManager) => {
      // 1. Obtener préstamo con bloqueo para evitar colisiones de pagos concurrentes
      const prestamo = await transactionalEntityManager.findOne(Prestamo, {
        where: { id: data.prestamo_id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!prestamo) {
        throw new ApiError(404, 'Préstamo no encontrado');
      }

      if (prestamo.estado === 'pagado') {
        throw new ApiError(400, 'Este préstamo ya ha sido cancelado en su totalidad');
      }

      // 2. Calcular saldo pendiente actual
      const result = await transactionalEntityManager
        .createQueryBuilder(Pago, 'pago')
        .select('SUM(pago.monto)', 'total')
        .where('pago.prestamo_id = :prestamoId', { prestamoId: data.prestamo_id })
        .getRawOne();
      
      const totalPagadoBefore = parseFloat(result.total || '0');
      const saldoCapitalPendiente = parseFloat(prestamo.monto_total.toString()) - totalPagadoBefore;
      const moraPendiente = parseFloat(prestamo.monto_mora.toString());

      // El monto enviado por el cliente primero debe cubrir la mora y luego el capital
      let montoParaMora = 0;
      let montoParaCapital = 0;

      if (data.monto <= moraPendiente) {
          montoParaMora = data.monto;
          montoParaCapital = 0;
      } else {
          montoParaMora = moraPendiente;
          montoParaCapital = data.monto - moraPendiente;
      }

      // 3. Validar que el monto para capital no exceda la deuda
      if (montoParaCapital > saldoCapitalPendiente + 0.05) { 
        throw new ApiError(
          400,
          `El monto excede la deuda total (Capital: ${saldoCapitalPendiente.toFixed(2)}, Mora: ${moraPendiente.toFixed(2)})`
        );
      }

      // 4. Registrar el pago
      const nuevoPago = this.repository.create({
          prestamo_id: data.prestamo_id,
          monto: montoParaCapital,
          monto_mora: montoParaMora,
          metodo_pago: data.metodo_pago,
          nro_cuota: data.nro_cuota,
          usuario_id: usuario_id,
          fecha_pago: new Date()
      });
      const pagoGuardado = await transactionalEntityManager.save(nuevoPago);

      // 5. Actualizar préstamo (reducir mora y verificar estado)
      prestamo.monto_mora = parseFloat((moraPendiente - montoParaMora).toFixed(2));
      
      if (totalPagadoBefore + montoParaCapital >= parseFloat(prestamo.monto_total.toString()) - 0.05) {
        prestamo.estado = 'pagado';
      }
      
      await transactionalEntityManager.save(prestamo);

      // 6. Registro en Bitácora
      await BitacoraService.register(
        usuario_id,
        'PAGO_REGISTRADO',
        `Pago de ${data.monto} (Cap: ${montoParaCapital}, Mora: ${montoParaMora}) registrado para préstamo #${data.prestamo_id}.`
      );

      return pagoGuardado;
    });
  }
}
