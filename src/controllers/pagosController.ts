import { Request, Response } from 'express';
import { PagoService } from '../services/PagoService';
import { tryCatch } from '../utils/tryCatch';

class PagoController {
  listarPorPrestamo = tryCatch(async (req: Request, res: Response) => {
    const { id_prestamo } = req.params;
    const historial = await PagoService.getByPrestamo(parseInt(id_prestamo as string));
    const totalPagado = await PagoService.getTotalPagado(parseInt(id_prestamo as string));

    res.status(200).json({
      success: true,
      data: {
        historial,
        totalPagado,
      },
    });
  });

  registrar = tryCatch(async (req: Request, res: Response) => {
    const { prestamo_id, monto, metodo_pago, nro_cuota } = req.body;
    const usuario_id = (req as any).user.id;

    const pago = await PagoService.create(
      {
        prestamo_id: parseInt(prestamo_id as string),
        monto: parseFloat(monto),
        metodo_pago,
        nro_cuota: parseInt(nro_cuota),
      },
      usuario_id,
    );

    res.status(201).json({
      success: true,
      message: 'Pago registrado correctamente',
      data: pago,
    });
  });
}

export default new PagoController();

