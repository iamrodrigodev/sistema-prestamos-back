import { Request, Response } from 'express';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { tryCatch } from '../utils/tryCatch';

dotenv.config();

class BackupController {
  // Generar y descargar copia de seguridad
  descargar = tryCatch(async (req: Request, res: Response) => {
    const fecha = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const fileName = `backup_sistema_${fecha}_${Date.now()}.sql`;
    // Guardamos temporalmente en la carpeta uploads (asegúrate de que exista)
    const uploadsDir = path.join(__dirname, '../../public/uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const filePath = path.join(uploadsDir, fileName);

    // Datos de conexión desde .env
    const dbUser = process.env.DB_USER || 'postgres';
    const dbPass = process.env.DB_PASSWORD || '';
    const dbName = process.env.DB_NAME || 'sistema_prestamos';
    const dbHost = process.env.DB_HOST || 'localhost';
    const dbPort = process.env.DB_PORT || '5432';

    // Construir comando para PostgreSQL (pg_dump)
    // Usamos PGPASSWORD para pasar la contraseña de forma segura
    let command = '';
    if (dbPass) {
      command = `SET PGPASSWORD=${dbPass} && `;
    }
    command += `pg_dump -h ${dbHost} -p ${dbPort} -U ${dbUser} -F c -b -v -f "${filePath}" ${dbName}`;

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
        // Importante: Borramos el archivo temporal después de descargar para no llenar el disco
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
