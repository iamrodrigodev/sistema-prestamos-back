import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Cliente } from './Cliente';

@Entity('empenos')
export class Empeno {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  cliente_id!: number;

  @ManyToOne(() => Cliente, (cliente) => cliente.empenos)
  @JoinColumn({ name: 'cliente_id' })
  cliente!: Cliente;

  @Column({ type: 'varchar', length: 100 })
  nombre_articulo!: string;

  @Column({ type: 'text', nullable: true })
  descripcion?: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  valor_tasacion!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  monto_prestado!: number;

  @Column({ type: 'date' })
  fecha_limite!: Date;

  @Column({ 
    type: 'enum', 
    enum: ['en_custodia', 'retirado', 'perdido', 'vendido'], 
    default: 'en_custodia' 
  })
  estado!: 'en_custodia' | 'retirado' | 'perdido' | 'vendido';

  @Column({ type: 'varchar', length: 255, nullable: true })
  imagen?: string;

  @CreateDateColumn()
  created_at!: Date;
}
