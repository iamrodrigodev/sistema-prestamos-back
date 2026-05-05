import { AppDataSource } from '../config/data-source';
import { Pago } from '../entities/Pago';
import { Prestamo } from '../entities/Prestamo';
import { MovimientoAhorro } from '../entities/MovimientoAhorro';
import { Gasto } from '../entities/Gasto';

export class CajaService {
  static async getResumen(fecha: string) {
    const startOfDay = new Date(fecha);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(fecha);
    endOfDay.setHours(23, 59, 59, 999);

    // 1. Cobros de Préstamos (Ingresos) - Incluyendo Mora
    const cobrosPrestamos = await AppDataSource.getRepository(Pago)
      .createQueryBuilder('pago')
      .select('SUM(pago.monto)', 'capital')
      .addSelect('SUM(pago.monto_mora)', 'mora')
      .where('pago.fecha_pago BETWEEN :start AND :end', { start: startOfDay, end: endOfDay })
      .getRawOne();

    // 2. Depósitos de Ahorro (Ingresos)
    const depositosAhorro = await AppDataSource.getRepository(MovimientoAhorro)
      .createQueryBuilder('mov')
      .select('SUM(mov.monto)', 'total')
      .where('mov.tipo_movimiento = :tipo AND mov.fecha_movimiento BETWEEN :start AND :end', {
        tipo: 'deposito',
        start: startOfDay,
        end: endOfDay,
      })
      .getRawOne();

    // 3. Préstamos Entregados (Egresos)
    const prestamosEntregados = await AppDataSource.getRepository(Prestamo)
      .createQueryBuilder('prestamo')
      .select('SUM(prestamo.monto_prestado)', 'total')
      .where('prestamo.fecha_inicio BETWEEN :start AND :end', { start: startOfDay, end: endOfDay })
      .getRawOne();

    // 4. Retiros de Ahorro (Egresos)
    const retirosAhorro = await AppDataSource.getRepository(MovimientoAhorro)
      .createQueryBuilder('mov')
      .select('SUM(mov.monto)', 'total')
      .where('mov.tipo_movimiento = :tipo AND mov.fecha_movimiento BETWEEN :start AND :end', {
        tipo: 'retiro',
        start: startOfDay,
        end: endOfDay,
      })
      .getRawOne();

    // 5. Gastos Operativos (Egresos)
    const gastosOperativos = await AppDataSource.getRepository(Gasto)
      .createQueryBuilder('gasto')
      .select('SUM(gasto.monto)', 'total')
      .where('gasto.fecha_gasto BETWEEN :start AND :end', { start: startOfDay, end: endOfDay })
      .getRawOne();

    const cobroCapital = parseFloat(cobrosPrestamos.capital || 0);
    const cobroMora = parseFloat(cobrosPrestamos.mora || 0);
    const depositos = parseFloat(depositosAhorro.total || 0);

    const ingresos = cobroCapital + cobroMora + depositos;
    
    const egresos =
      parseFloat(prestamosEntregados.total || 0) +
      parseFloat(retirosAhorro.total || 0) +
      parseFloat(gastosOperativos.total || 0);

    return {
      fecha,
      ingresos: {
        cobroCapital,
        cobroMora,
        depositosAhorro: depositos,
        total: ingresos,
      },
      egresos: {
        prestamosEntregados: parseFloat(prestamosEntregados.total || 0),
        retirosAhorro: parseFloat(retirosAhorro.total || 0),
        gastosOperativos: parseFloat(gastosOperativos.total || 0),
        total: egresos,
      },
      saldoNeto: ingresos - egresos,
    };
  }
}
