import app from './app';
import { AppDataSource } from './config/data-source';
import { seedDatabase } from './config/seed';
import { MoraService } from './services/MoraService';
import { ENV, CONSTANTS } from './config/env';

const startServer = async () => {
  try {
    await AppDataSource.initialize();
    console.log('Base de datos conectada correctamente.');

    // Semilla inicial y procesos automáticos
    await seedDatabase();
    await MoraService.calcularMoraGlobal();

    // Configurar intervalo para cálculo de mora
    setInterval(() => {
      MoraService.calcularMoraGlobal().catch(console.error);
    }, CONSTANTS.MORA_REFRESH_INTERVAL);

    // Iniciar servidor
    app.listen(ENV.PORT, () => {
      console.log(`Servidor ejecutándose en http://localhost:${ENV.PORT}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();
