import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 100 })
  nombre!: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  usuario!: string;

  @Column({ type: 'varchar', length: 255 })
  password!: string;

  @Column({ type: 'enum', enum: ['admin', 'empleado'], default: 'empleado' })
  rol!: 'admin' | 'empleado';

  @Column({ type: 'int', default: 1 })
  estado!: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  foto?: string;

  @CreateDateColumn()
  created_at!: Date;
}
