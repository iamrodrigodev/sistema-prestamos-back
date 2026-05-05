import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Prestamo } from './Prestamo';
import { Usuario } from './Usuario';

@Entity('pagos')
export class Pago {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  prestamo_id!: number;

  @ManyToOne(() => Prestamo, (prestamo) => prestamo.pagos)
  @JoinColumn({ name: 'prestamo_id' })
  prestamo!: Prestamo;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  monto!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0.00 })
  monto_mora!: number;

  @CreateDateColumn()
  fecha_pago!: Date;

  @Column({ type: 'varchar', length: 50 })
  metodo_pago!: string;

  @Column({ type: 'int' })
  nro_cuota!: number;

  @Column()
  usuario_id!: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_id' })
  usuario!: Usuario;
}
