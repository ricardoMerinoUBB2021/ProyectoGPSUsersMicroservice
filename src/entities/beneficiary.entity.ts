import { Entity, Column, OneToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Usuario, TipoUsuario } from './user.entity';

export interface Receta {
  id: string;
  beneficiarioId: string;
  medicoNombre: string;
  medicoRut: string;
  fechaEmision: string;
  fechaVencimiento: string;
  productos: Array<{
    codigo: string;
    nombre: string;
    cantidad: number;
    indicaciones: string;
    periodoDispensacion: number;
  }>;
  activa: boolean;
}

export interface HistorialCompra {
  id: string;
  fecha: Date;
  producto: string;
  cantidad: number;
  total: number;
}

@Entity('beneficiarios')
export class Beneficiario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Usuario)
  @JoinColumn({ name: 'id' })
  usuario: Usuario;

  @Column({ name: 'categoria_descuento' })
  categoriaDescuento: string;

  @Column({ name: 'observaciones_medicas', nullable: true })
  observacionesMedicas: string;

  @Column({ name: 'recetas', type: 'jsonb', nullable: true })
  recetas: Receta[];

  @Column({ name: 'historial_compras', type: 'jsonb', nullable: true })
  historialCompras: HistorialCompra[];
} 