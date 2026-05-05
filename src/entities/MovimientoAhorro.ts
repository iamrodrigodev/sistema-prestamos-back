import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { CuentaAhorro } from './CuentaAhorro';

@Entity('movimientos_ahorro')
export class MovimientoAhorro {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  cuenta_id!: number;

  @ManyToOne(() => CuentaAhorro, (cuenta) => cuenta.movimientos)
  @JoinColumn({ name: 'cuenta_id' })
  cuenta!: CuentaAhorro;

  @Column({ type: 'enum', enum: ['deposito', 'retiro', 'interes_ganado'] })
  tipo_movimiento!: 'deposito' | 'retiro' | 'interes_ganado';

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  monto!: number;

  @CreateDateColumn()
  fecha_movimiento!: Date;

  @Column({ type: 'text', nullable: true })
  observacion?: string;
}
