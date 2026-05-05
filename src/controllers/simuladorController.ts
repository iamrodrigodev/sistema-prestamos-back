import { Request, Response } from 'express';
import { SimuladorService } from '../services/SimuladorService';
import { tryCatch } from '../utils/tryCatch';

class SimuladorController {
  calcular = tryCatch(async (req: Request, res: Response) => {
    const { monto, interes, cuotas, frecuencia } = req.body;

    if (!monto || !interes || !cuotas) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos obligatorios',
      });
    }

    const resultado = await SimuladorService.calcular({
      monto: parseFloat(monto),
      interes: parseFloat(interes),
      cuotas: parseInt(cuotas),
      frecuencia,
    });

    res.status(200).json({
      success: true,
      data: resultado,
    });
  });
}

export default new SimuladorController();

