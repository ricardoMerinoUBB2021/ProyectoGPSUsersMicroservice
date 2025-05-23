import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('permisos')
export class Permiso {
  @PrimaryColumn()
  codigo: string;

  @Column()
  nombre: string;

  @Column({ nullable: true })
  descripcion: string;

  @Column()
  modulo: string;
} 