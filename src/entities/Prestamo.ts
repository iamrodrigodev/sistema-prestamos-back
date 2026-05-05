import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Cliente } from './Cliente';
import { Pago } from './Pago';

@Entity('prestamos')
export class Prestamo {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  cliente_id!: number;

  @ManyToOne(() => Cliente, (cliente) => cliente.prestamos)
  @JoinColumn({ name: 'cliente_id' })
  cliente!: Cliente;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  monto_prestado!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  tasa_interes!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  monto_total!: number;

  @Column({ type: 'int' })
  cuotas!: number;

  @Column({ type: 'enum', enum: ['diario', 'semanal', 'quincenal', 'mensual'], default: 'mensual' })
  frecuencia!: 'diario' | 'semanal' | 'quincenal' | 'mensual';

  @Column({ type: 'date' })
  fecha_inicio!: Date;

  @Column({ type: 'date' })
  fecha_fin!: Date;

  @Column({ type: 'enum', enum: ['pendiente', 'pagado', 'vencido'], default: 'pendiente' })
  estado!: 'pendiente' | 'pagado' | 'vencido';

  @CreateDateColumn()
  created_at!: Date;

  @OneToMany(() => Pago, (pago) => pago.prestamo)
  pagos!: Pago[];
}
