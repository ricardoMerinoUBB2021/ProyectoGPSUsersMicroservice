import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  JoinColumn
} from 'typeorm';

export enum TipoUsuario {
  BENEFICIARIO = 'BENEFICIARIO',
  ADMIN = 'ADMIN',
  FARMACEUTICO = 'FARMACEUTICO',
  CAJERO = 'CAJERO',
  VENDEDOR = 'VENDEDOR',
  ADMIN_INVENTARIO = 'ADMIN_INVENTARIO'
}

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  rut: string;

  @Column()
  nombres: string;

  @Column()
  apellidos: string;

  @Column({ type: 'date' })
  fechaNacimiento: string;

  @Column()
  direccion: string;

  @Column()
  comuna: string;

  @Column()
  telefono: string;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fechaRegistro: string;

  @Column({ default: true })
  activo: boolean;

  @Column({
    type: 'enum',
    enum: TipoUsuario,
    default: TipoUsuario.BENEFICIARIO
  })
  tipo: TipoUsuario;

  @Column({ type: 'jsonb' })
  credenciales: {
    username: string;
    passwordHash: string;
    ultimoAcceso: string;
    intentosFallidos: number;
    bloqueado: boolean;
  };

  @Column('text', { array: true })
  permisos: string[];
} 