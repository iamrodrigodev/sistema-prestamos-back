import { Request, Response } from 'express';
import { PrestamoService } from '../services/PrestamoService';
import { PagoService } from '../services/PagoService';
import { ConfigService } from '../services/ConfigService';
import { ReporteService } from '../services/ReporteService';
import { tryCatch } from '../utils/tryCatch';

class ReportesController {
  generarContrato = tryCatch(async (req: Request, res: Response) => {
    const { id } = req.params;
    const prestamo = await PrestamoService.getById(parseInt(id as string));
    const config = await ConfigService.get();

    res.render('contrato', {
      prestamo,
      config,
    });
  });

  generarTicket = tryCatch(async (req: Request, res: Response) => {
    const { id } = req.params;
    const pago = await PagoService.getById(parseInt(id as string));
    const config = await ConfigService.get();

    res.render('ticket', {
      pago,
      config,
    });
  });

  exportarExcelPrestamos = tryCatch(async (req: Request, res: Response) => {
    const workbook = await ReporteService.generarExcelPrestamos();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=Reporte_Prestamos.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  });

  descargarReporteAvanzado = tryCatch(async (req: Request, res: Response) => {
    const { tipo_reporte, fecha_inicio, fecha_fin } = req.body;
    const workbook = await ReporteService.generarExcelAvanzado(
        tipo_reporte as string, 
        fecha_inicio as string, 
        fecha_fin as string
    );
    const fileName = `Reporte_${tipo_reporte}_${Date.now()}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    await workbook.xlsx.write(res);
    res.end();
  });
}

export default new ReportesController();
