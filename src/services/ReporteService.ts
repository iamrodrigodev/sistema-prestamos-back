import { AppDataSource } from '../config/data-source';
import { Prestamo } from '../entities/Prestamo';
import { Pago } from '../entities/Pago';
import { Gasto } from '../entities/Gasto';
import { Between } from 'typeorm';
import ExcelJS from 'exceljs';

export class ReporteService {
  static async getPrestamosByDate(desde: string, hasta: string) {
    const start = new Date(desde);
    start.setHours(0, 0, 0, 0);
    const end = new Date(hasta);
    end.setHours(23, 59, 59, 999);

    return await AppDataSource.getRepository(Prestamo).find({
      where: {
        fecha_inicio: Between(start, end)
      },
      relations: ['cliente'],
      order: { fecha_inicio: 'DESC' }
    });
  }

  static async getPagosByDate(desde: string, hasta: string) {
    const start = new Date(desde);
    start.setHours(0, 0, 0, 0);
    const end = new Date(hasta);
    end.setHours(23, 59, 59, 999);

    return await AppDataSource.getRepository(Pago).find({
      where: {
        fecha_pago: Between(start, end)
      },
      relations: ['prestamo', 'prestamo.cliente'],
      order: { fecha_pago: 'DESC' }
    });
  }

  static async getGastosByDate(desde: string, hasta: string) {
    const start = new Date(desde);
    start.setHours(0, 0, 0, 0);
    const end = new Date(hasta);
    end.setHours(23, 59, 59, 999);

    return await AppDataSource.getRepository(Gasto).find({
      where: {
        fecha_gasto: Between(start, end)
      },
      order: { fecha_gasto: 'DESC' }
    });
  }

  static async generarExcelPrestamos() {
    const prestamoRepo = AppDataSource.getRepository(Prestamo);
    const prestamos = await prestamoRepo.find({ relations: ['cliente'] });
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reporte de Préstamos');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Cliente', key: 'cliente', width: 30 },
      { header: 'DNI', key: 'dni', width: 15 },
      { header: 'Monto Prestado', key: 'monto', width: 15 },
      { header: 'Interés (%)', key: 'interes', width: 15 },
      { header: 'Total a Pagar', key: 'total', width: 15 },
      { header: 'Fecha Inicio', key: 'fecha', width: 15 },
      { header: 'Cuotas', key: 'cuotas', width: 10 },
      { header: 'Frecuencia', key: 'frecuencia', width: 15 },
      { header: 'Estado', key: 'estado', width: 15 }
    ];

    worksheet.getRow(1).font = { bold: true };

    prestamos.forEach((p: any) => {
      worksheet.addRow({
        id: p.id,
        cliente: `${p.cliente.nombre} ${p.cliente.apellido}`,
        dni: p.cliente.dni,
        monto: Number(p.monto_prestado),
        interes: p.tasa_interes + '%',
        total: Number(p.monto_total),
        fecha: new Date(p.fecha_inicio).toLocaleDateString(),
        cuotas: p.cuotas,
        frecuencia: p.frecuencia.toUpperCase(),
        estado: p.estado.toUpperCase()
      });
    });

    return workbook;
  }

  static async generarExcelAvanzado(tipo: string, inicio: string, fin: string) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Datos Exportados');

    if (tipo === 'prestamos') {
      const datos = await this.getPrestamosByDate(inicio, fin);
      worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Cliente', key: 'cliente', width: 30 },
        { header: 'DNI', key: 'dni', width: 15 },
        { header: 'Monto Prestado', key: 'monto', width: 15 },
        { header: 'Fecha', key: 'fecha', width: 15 },
        { header: 'Estado', key: 'estado', width: 15 }
      ];
      datos.forEach(d => {
        worksheet.addRow({
          id: d.id,
          cliente: `${d.cliente.nombre} ${d.cliente.apellido}`,
          dni: d.cliente.dni,
          monto: d.monto_prestado,
          fecha: new Date(d.fecha_inicio).toLocaleDateString(),
          estado: d.estado.toUpperCase()
        });
      });
    } else if (tipo === 'pagos') {
      const datos = await this.getPagosByDate(inicio, fin);
      worksheet.columns = [
        { header: 'ID Pago', key: 'id', width: 10 },
        { header: 'Fecha', key: 'fecha', width: 20 },
        { header: 'Cliente', key: 'cliente', width: 30 },
        { header: 'Monto', key: 'monto', width: 15 }
      ];
      datos.forEach(d => {
        worksheet.addRow({
          id: d.id,
          fecha: new Date(d.fecha_pago).toLocaleString(),
          cliente: `${d.prestamo.cliente.nombre} ${d.prestamo.cliente.apellido}`,
          monto: d.monto
        });
      });
    }

    return workbook;
  }
}
