import finance from '../utils/finance';

export class SimuladorService {
  static calcular(data: { monto: number; interes: number; cuotas: number; frecuencia: string }) {
    const { monto, interes, cuotas, frecuencia } = data;

    const montoInteres = monto * (interes / 100);
    const montoTotal = monto + montoInteres;

    const cronograma = finance.calcularCronograma(montoTotal, cuotas, frecuencia, new Date());

    return {
      montoPrestado: monto,
      tasa: interes,
      montoTotal,
      montoInteres,
      cronograma,
    };
  }
}
