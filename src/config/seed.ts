import { AppDataSource } from './data-source';
import { Usuario } from '../entities/Usuario';
import { Configuracion } from '../entities/Configuracion';
import bcrypt from 'bcryptjs';

export const seedDatabase = async () => {
  const usuarioRepo = AppDataSource.getRepository(Usuario);
  const configRepo = AppDataSource.getRepository(Configuracion);

  // 1. Seed Admin User
  const adminExists = await usuarioRepo.findOne({ where: { usuario: 'admin' } });
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = usuarioRepo.create({
      nombre: 'Administrador del Sistema',
      usuario: 'admin',
      password: hashedPassword,
      rol: 'admin',
      estado: 1,
    });
    await usuarioRepo.save(admin);
    console.log('Admin user created: admin / admin123');
  }

  // 2. Seed Default Configuration
  const configExists = await configRepo.findOne({ where: { id: 1 } });
  if (!configExists) {
    const config = configRepo.create({
      id: 1,
      nombre_empresa: 'Mi Financiera SAC',
      ruc: '20123456789',
      direccion: 'Av. Principal 123, Lima',
      telefono: '01 444-5555',
      email_contacto: 'contacto@mifinanciera.com',
      moneda: 'S/',
    });
    await configRepo.save(config);
    console.log('Default configuration created');
  }
};
