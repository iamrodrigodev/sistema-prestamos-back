import 'reflect-metadata';
import { DataSource } from 'typeorm';
import dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sistema_prestamos',
  synchronize: true, // Crea/actualiza las tablas automáticamente
  dropSchema: true, // Borra las tablas cada vez que se levanta (como ddl-auto=create en Spring)
  logging: process.env.NODE_ENV === 'development',
  entities: [__dirname + '/../entities/*.ts'],
  migrations: [__dirname + '/../migrations/*.ts'],
  subscribers: [],
});
