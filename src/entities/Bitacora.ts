import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Usuario } from './Usuario';

@Entity('bitacora')
export class Bitacora {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true })
  usuario_id?: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_id' })
  usuario?: Usuario;

  @Column({ type: 'varchar', length: 50 })
  accion!: string;

  @Column({ type: 'text', nullable: true })
  detalle?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  ip?: string;

  @CreateDateColumn()
  fecha!: Date;
}
