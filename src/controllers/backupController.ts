import { Request, Response } from 'express';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { tryCatch } from '../utils/tryCatch';
import { ENV } from '../config/env';

class BackupController {
  // Generar y descargar copia de seguridad
  descargar = tryCatch(async (req: Request, res: Response) => {
    const fecha = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const fileName = `backup_sistema_${fecha}_${Date.now()}.sql`;
    
    const uploadsDir = ENV.PATHS.UPLOADS;
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const filePath = path.join(uploadsDir, fileName);

    // Datos de conexión desde ENV
    const { DB_USER, DB_PASSWORD, DB_NAME, DB_HOST, DB_PORT } = ENV;

    // Construir comando para PostgreSQL (pg_dump)
    let command = '';
    if (DB_PASSWORD) {
      command = `SET PGPASSWORD=${DB_PASSWORD} && `;
    }
    command += `pg_dump -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -F c -b -v -f "${filePath}" ${DB_NAME}`;

    // Ejecutar el comando en el sistema operativo
    exec(command, (error, stdout, stderr) => {
      if (error) {
        return res.status(500).json({
          success: false,
          message: 'Error al crear el respaldo. Verifica que pg_dump esté instalado y accesible.',
          error: error.message,
        });
      }

      // Si todo salió bien, enviamos el archivo al navegador
      res.download(filePath, fileName, (err) => {
        // Importante: Borramos el archivo temporal después de descargar
        try {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (e) {
          console.error('Error al borrar archivo temporal:', e);
        }

        if (err && !res.headersSent) {
          return res.status(500).json({
            success: false,
            message: 'Error al descargar el archivo de respaldo.',
          });
        }
      });
    });
  });
}

export default new BackupController();
