import { AppDataSource } from '../config/data-source';
import { Prestamo } from '../entities/Prestamo';
import { Configuracion } from '../entities/Configuracion';

export class MoraService {

  static async calcularMoraGlobal() {
    const prestamoRepo = AppDataSource.getRepository(Prestamo);
    const configRepo = AppDataSource.getRepository(Configuracion);

    const config = await configRepo.findOne({ where: { id: 1 } });
    if (!config) return;

    const { tasa_mora_diaria, dias_gracia_mora } = config;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const prestamos = await prestamoRepo.createQueryBuilder('p')
      .where('p.estado IN (:...estados)', { estados: ['pendiente', 'vencido'] })
      .andWhere('p.fecha_fin < :hoy', { hoy })
      .getMany();

    for (const prestamo of prestamos) {
      const fechaVencimiento = new Date(prestamo.fecha_fin);
      fechaVencimiento.setHours(0, 0, 0, 0);

      const diffTime = Math.abs(hoy.getTime() - fechaVencimiento.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > dias_gracia_mora) {

        const moraCalculada = (parseFloat(prestamo.monto_total.toString()) * (parseFloat(tasa_mora_diaria.toString()) / 100)) * diffDays;
        
        prestamo.monto_mora = parseFloat(moraCalculada.toFixed(2));
        prestamo.estado = 'vencido';
        await prestamoRepo.save(prestamo);
      }
    }
  }
}
