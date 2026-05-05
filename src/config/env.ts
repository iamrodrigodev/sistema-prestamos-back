import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT) || 3000,
  
  // Base de Datos
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: Number(process.env.DB_PORT) || 5433,
  DB_USER: process.env.DB_USER || 'postgres',
  DB_PASSWORD: process.env.DB_PASSWORD || 'admin123',
  DB_NAME: process.env.DB_NAME || 'sistema_prestamos',

  // Seguridad y Sesiones
  SESSION_SECRET: process.env.SESSION_SECRET || 'mi_secreto_seguro_predeterminado',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',

  // Email
  EMAIL_HOST: process.env.EMAIL_HOST || '',
  EMAIL_PORT: Number(process.env.EMAIL_PORT) || 465,
  EMAIL_USER: process.env.EMAIL_USER || '',
  EMAIL_PASS: process.env.EMAIL_PASS || '',

  // Rutas y Directorios
  PATHS: {
    UPLOADS: path.join(__dirname, '../../public/uploads'),
    TEMPLATES: path.join(__dirname, '../templates'),
  }
};

export const CONSTANTS = {
  MORA_REFRESH_INTERVAL: 1000 * 60 * 60 * 12, // 12 horas
  SESSION_MAX_AGE: 1000 * 60 * 60 * 24, // 1 día
};
