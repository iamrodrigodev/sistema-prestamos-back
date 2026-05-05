import { Request, Response } from 'express';
import { ConfigService } from '../services/ConfigService';
import { tryCatch } from '../utils/tryCatch';
import { ApiError } from '../utils/ApiError';

class ConfigController {
  obtener = tryCatch(async (req: Request, res: Response) => {
    const config = await ConfigService.get();
    res.status(200).json({
      success: true,
      data: config,
    });
  });

  actualizar = tryCatch(async (req: Request, res: Response) => {
    const { nombre_empresa, ruc, direccion, telefono, email_contacto, moneda, tasa_mora_diaria, dias_gracia_mora } = req.body;
    const logo = req.file ? req.file.filename : undefined;

    if (!req.user) throw new ApiError(401, 'No autorizado');

    const dataToUpdate = {
      nombre_empresa,
      ruc,
      direccion,
      telefono,
      email_contacto,
      moneda,
      tasa_mora_diaria: tasa_mora_diaria ? parseFloat(tasa_mora_diaria) : undefined,
      dias_gracia_mora: dias_gracia_mora ? parseInt(dias_gracia_mora) : undefined,
      logo
    };

    const config = await ConfigService.update(dataToUpdate, req.user.id);

    res.status(200).json({
      success: true,
      message: 'Configuración actualizada correctamente',
      data: config,
    });
  });
}

export default new ConfigController();
