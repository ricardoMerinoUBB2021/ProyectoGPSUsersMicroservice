export type TipoUsuario = 'BENEFICIARIO' | 'ADMIN' | 'FARMACEUTICO' | 'CAJERO' | 'VENDEDOR' | 'ADMIN_INVENTARIO';

export interface Usuario {
  id: string;
  rut: string;
  nombres: string;
  apellidos: string;
  fechaNacimiento: string;
  direccion: string;
  comuna: string;
  telefono: string;
  email: string;
  fechaRegistro: string;
  activo: boolean;
  tipo: TipoUsuario;
  credenciales: {
    username: string;
    passwordHash: string;
    ultimoAcceso: string;
    intentosFallidos: number;
    bloqueado: boolean;
  };
  permisos: string[]; // Array de códigos de permiso
}

export interface Beneficiario extends Usuario {
  categoriaDescuento: string;
  observacionesMedicas: string;
  recetas: Receta[];
  historialCompras: HistorialCompra[];
}

export interface Permiso {
  codigo: string;
  nombre: string;
  descripcion: string;
  modulo: string;
}

export interface Rol {
  id: string;
  nombre: string;
  descripcion: string;
  permisos: string[]; // Array de códigos de permiso
  creadoPor: string;
  fechaCreacion: string;
}

// Define Receta y HistorialCompra si no existen
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
  fecha: string;
  producto: string;
  cantidad: number;
  total: number;
}