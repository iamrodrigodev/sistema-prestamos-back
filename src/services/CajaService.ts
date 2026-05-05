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

    // 1. Cobros de Préstamos (Ingresos)
    const cobrosPrestamos = await AppDataSource.getRepository(Pago)
      .createQueryBuilder('pago')
      .select('SUM(pago.monto)', 'total')
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
      .where('gasto.fecha BETWEEN :start AND :end', { start: startOfDay, end: endOfDay })
      .getRawOne();

    const ingresos = parseFloat(cobrosPrestamos.total || 0) + parseFloat(depositosAhorro.total || 0);
    const egresos =
      parseFloat(prestamosEntregados.total || 0) +
      parseFloat(retirosAhorro.total || 0) +
      parseFloat(gastosOperativos.total || 0);

    return {
      fecha,
      ingresos: {
        cobrosPrestamos: parseFloat(cobrosPrestamos.total || 0),
        depositosAhorro: parseFloat(depositosAhorro.total || 0),
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
