import finance from '../utils/finance';
import { AppDataSource } from '../config/data-source';
import { Configuracion } from '../entities/Configuracion';

export class SimuladorService {
  static async calcular(data: { monto: number; interes: number; cuotas: number; frecuencia: string }) {
    const { monto, interes, cuotas, frecuencia } = data;

    const montoInteres = monto * (interes / 100);
    const montoTotal = monto + montoInteres;

    const cronograma = finance.calcularCronograma(montoTotal, cuotas, frecuencia, new Date());
    
    // Obtener símbolo de moneda para el simulador
    const configRepo = AppDataSource.getRepository(Configuracion);
    const config = await configRepo.findOne({ where: { id: 1 } });
    const moneda = config ? config.moneda : '$';

    return {
      montoPrestado: monto,
      tasa: interes,
      montoTotal,
      montoInteres,
      moneda,
      cronograma,
    };
  }
}
