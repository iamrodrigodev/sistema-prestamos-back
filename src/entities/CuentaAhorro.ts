import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Cliente } from './Cliente';
import { MovimientoAhorro } from './MovimientoAhorro';

@Entity('cuentas_ahorro')
export class CuentaAhorro {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  cliente_id!: number;

  @ManyToOne(() => Cliente)
  @JoinColumn({ name: 'cliente_id' })
  cliente!: Cliente;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0.00 })
  saldo_actual!: number;

  @CreateDateColumn()
  fecha_apertura!: Date;

  @OneToMany(() => MovimientoAhorro, (movimiento) => movimiento.cuenta)
  movimientos!: MovimientoAhorro[];
}
