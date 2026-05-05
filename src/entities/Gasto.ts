import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Usuario } from './Usuario';

@Entity('gastos')
export class Gasto {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  descripcion!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  monto!: number;

  @Column({ type: 'varchar', length: 50 })
  categoria!: string;

  @Column({ type: 'date' })
  fecha_gasto!: Date;

  @Column({ nullable: true })
  usuario_id?: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_id' })
  usuario?: Usuario;

  @Column({ type: 'varchar', length: 100, default: 'Sistema' })
  registrado_por!: string;

  @Column({ type: 'text', nullable: true })
  observacion?: string;

  @CreateDateColumn()
  created_at!: Date;
}
