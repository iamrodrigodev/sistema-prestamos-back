import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('configuracion')
export class Configuracion {
  @PrimaryColumn()
  id!: number;

  @Column({ type: 'varchar', length: 100, default: 'Mi Financiera' })
  nombre_empresa!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  ruc?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  direccion?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  telefono?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  email_contacto?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  logo?: string;

  @Column({ type: 'varchar', length: 5, default: '$' })
  moneda!: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 1.00 })
  tasa_mora_diaria!: number;

  @Column({ type: 'int', default: 0 })
  dias_gracia_mora!: number;
}
