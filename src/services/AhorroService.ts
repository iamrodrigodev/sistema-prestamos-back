import { AppDataSource } from '../config/data-source';
import { CuentaAhorro } from '../entities/CuentaAhorro';
import { MovimientoAhorro } from '../entities/MovimientoAhorro';
import { ApiError } from '../utils/ApiError';
import { EmailService } from './EmailService';
import { Configuracion } from '../entities/Configuracion';
import { BitacoraService } from './BitacoraService';

export class AhorroService {
  private static cuentaRepo = AppDataSource.getRepository(CuentaAhorro);
  private static movimientoRepo = AppDataSource.getRepository(MovimientoAhorro);
  private static configRepo = AppDataSource.getRepository(Configuracion);

  static async getAll(page = 1, limit = 10) {
    const [items, total] = await this.cuentaRepo.findAndCount({
      relations: ['cliente'],
      skip: (page - 1) * limit,
      take: limit,
      order: { fecha_apertura: 'DESC' },
    });

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getById(id: number) {
    const cuenta = await this.cuentaRepo.findOne({
      where: { id },
      relations: ['cliente', 'movimientos'],
    });

    if (!cuenta) {
      throw new ApiError(404, 'Cuenta de ahorro no encontrada');
    }

    return cuenta;
  }

  static async create(cliente_id: number, usuario_id: number) {
    const existe = await this.cuentaRepo.findOne({ where: { cliente_id } });
    if (existe) {
      throw new ApiError(400, 'Este cliente ya tiene una cuenta activa');
    }

    const nuevaCuenta = this.cuentaRepo.create({ cliente_id, saldo_actual: 0 });
    const guardada = await this.cuentaRepo.save(nuevaCuenta);

    await BitacoraService.register(usuario_id, 'APERTURA_CUENTA', `Cuenta de ahorro #${guardada.id} abierta para cliente #${cliente_id}`);

    return guardada;
  }

  static async addMovement(
    cuenta_id: number,
    tipo: 'deposito' | 'retiro',
    monto: number,
    usuario_id: number,
    observacion?: string,
  ) {
    if (monto <= 0) {
      throw new ApiError(400, 'El monto debe ser mayor a 0');
    }

    const cuenta = await this.cuentaRepo.findOne({
      where: { id: cuenta_id },
      relations: ['cliente'],
    });

    if (!cuenta) {
      throw new ApiError(404, 'Cuenta no encontrada');
    }

    if (tipo === 'retiro' && monto > cuenta.saldo_actual) {
      throw new ApiError(400, 'Saldo insuficiente para realizar el retiro');
    }

    return await AppDataSource.transaction(async (transactionalEntityManager) => {
      const movimiento = this.movimientoRepo.create({
        cuenta_id,
        tipo_movimiento: tipo,
        monto,
        observacion,
      });

      await transactionalEntityManager.save(movimiento);

      if (tipo === 'deposito') {
        cuenta.saldo_actual = Number(cuenta.saldo_actual) + monto;
      } else {
        cuenta.saldo_actual = Number(cuenta.saldo_actual) - monto;
      }

      await transactionalEntityManager.save(cuenta);

      // Bitácora
      await BitacoraService.register(
        usuario_id,
        tipo === 'deposito' ? 'DEPOSITO_AHORRO' : 'RETIRO_AHORRO',
        `${tipo.toUpperCase()} de ${monto} en cuenta #${cuenta_id}`,
      );

      this.notifyByEmail(cuenta, tipo, monto, cuenta.saldo_actual).catch();

      return movimiento;
    });
  }

  private static async notifyByEmail(
    cuenta: CuentaAhorro,
    tipo: 'deposito' | 'retiro',
    monto: number,
    nuevoSaldo: number,
  ) {
    if (cuenta.cliente && cuenta.cliente.email) {
      const config = await this.configRepo.findOne({ where: {} });
      const simboloMoneda = config ? config.moneda : '$';

      const html = EmailService.plantillaAhorro(
        `${cuenta.cliente.nombre} ${cuenta.cliente.apellido}`,
        tipo,
        monto,
        nuevoSaldo,
        simboloMoneda,
      );
      await EmailService.enviarCorreo(cuenta.cliente.email, `Notificación de ${tipo.toUpperCase()}`, html);
    }
  }
}
