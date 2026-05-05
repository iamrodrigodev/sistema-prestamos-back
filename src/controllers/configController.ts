import { Request, Response } from 'express';
import { ConfigService } from '../services/ConfigService';
import { tryCatch } from '../utils/tryCatch';

class ConfigController {
  obtener = tryCatch(async (req: Request, res: Response) => {
    const config = await ConfigService.get();
    res.status(200).json({
      success: true,
      data: config,
    });
  });

  actualizar = tryCatch(async (req: Request, res: Response) => {
    const { nombre_empresa, ruc, direccion, telefono, email_contacto, moneda } = req.body;
    const logo = req.file ? req.file.filename : undefined;

    const dataToUpdate: any = {
      nombre_empresa,
      ruc,
      direccion,
      telefono,
      email_contacto,
      moneda,
    };
    if (logo) dataToUpdate.logo = logo;

    const config = await ConfigService.update(dataToUpdate);

    res.status(200).json({
      success: true,
      message: 'Configuración actualizada correctamente',
      data: config,
    });
  });
}

export default new ConfigController();

