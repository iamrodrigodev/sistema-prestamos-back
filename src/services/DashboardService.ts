import { AppDataSource } from '../config/data-source';
import { Cliente } from '../entities/Cliente';
import { Prestamo } from '../entities/Prestamo';
import { Empeno } from '../entities/Empeno';
import { Pago } from '../entities/Pago';
import { CuentaAhorro } from '../entities/CuentaAhorro';

export class DashboardService {
  static async getStats() {
    const clienteRepo = AppDataSource.getRepository(Cliente);
    const prestamoRepo = AppDataSource.getRepository(Prestamo);
    const empenoRepo = AppDataSource.getRepository(Empeno);
    const pagoRepo = AppDataSource.getRepository(Pago);
    const ahorroRepo = AppDataSource.getRepository(CuentaAhorro);

    const [clientes, prestamosPendientes, empenosCustodia, totalPagos, totalPrestadoHistorico, totalAhorros] = await Promise.all([
      clienteRepo.count(),
      prestamoRepo.createQueryBuilder('p')
        .select('SUM(p.monto_prestado)', 'total')
        .where('p.estado = :estado', { estado: 'pendiente' })
        .getRawOne(),
      empenoRepo.count({ where: { estado: 'en_custodia' } }),
      pagoRepo.createQueryBuilder('pago')
        .select('SUM(pago.monto)', 'total')
        .getRawOne(),
      prestamoRepo.createQueryBuilder('p')
        .select('SUM(p.monto_prestado)', 'total')
        .getRawOne(),
      ahorroRepo.createQueryBuilder('a')
        .select('SUM(a.saldo_actual)', 'total')
        .getRawOne()
    ]);

    return {
      clientes,
      dineroPrestado: parseFloat(prestamosPendientes.total || 0),
      articulosEmpeno: empenosCustodia,
      dineroCobrado: parseFloat(totalPagos.total || 0),
      totalPrestadoHistorico: parseFloat(totalPrestadoHistorico.total || 0),
      totalAhorros: parseFloat(totalAhorros.total || 0)
    };
  }

  static async getChartData() {
    const prestamoRepo = AppDataSource.getRepository(Prestamo);
    const data = await prestamoRepo.createQueryBuilder('p')
      .select('p.estado', 'estado')
      .addSelect('COUNT(*)', 'cantidad')
      .groupBy('p.estado')
      .getRawMany();
    
    return data;
  }

  static async getFullDashboard() {
    const totales = await this.getStats();
    const datosGrafico = await this.getChartData();

    const estados: { [key: string]: number } = { pendiente: 0, pagado: 0, vencido: 0 };
    datosGrafico.forEach((d: any) => {
      estados[d.estado] = parseInt(d.cantidad);
    });

    return {
      totales,
      graficos: {
        estados: [estados.pendiente, estados.pagado, estados.vencido],
        balance: [totales.totalPrestadoHistorico, totales.dineroCobrado]
      }
    };
  }
}
