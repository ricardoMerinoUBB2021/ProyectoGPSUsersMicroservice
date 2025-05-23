import * as bcrypt from 'bcrypt';
import AppDataSource from '../config/data-source';
import { Usuario, TipoUsuario } from '../entities/user.entity';
import { Beneficiario } from '../entities/beneficiary.entity';
import { Rol } from '../entities/role.entity';
import { Permiso } from '../entities/permission.entity';

/**
 * Seed the database with initial test data
 */
export async function seedDatabase() {
  try {
    // Initialize the database connection
    await AppDataSource.initialize();
    console.log('Database connection established for seeding');
    
    // Create permissions
    const permissions = await seedPermissions();
    
    // Create roles with permissions
    const roles = await seedRoles(permissions);
    
    // Create admin user
    const admin = await seedAdminUser(roles.find(r => r.nombre === 'Administrador')?.permisos || []);
    
    // Create sample users of different types
    await seedSampleUsers();
    
    // Create beneficiaries
    await seedBeneficiaries();
    
    console.log('Database seeded successfully');
    await AppDataSource.destroy();
  } catch (error) {
    console.error('Error seeding database:', error);
    await AppDataSource.destroy();
    process.exit(1);
  }
}

/**
 * Seed permissions
 */
async function seedPermissions(): Promise<Permiso[]> {
  const permissionRepository = AppDataSource.getRepository(Permiso);
  
  // Clear existing permissions
  await permissionRepository.clear();
  
  // Define permissions
  const permissionsData = [
    { codigo: 'USER_CREATE', nombre: 'Crear Usuario', descripcion: 'Permite crear nuevos usuarios', modulo: 'usuarios' },
    { codigo: 'USER_READ', nombre: 'Ver Usuario', descripcion: 'Permite ver detalles de usuarios', modulo: 'usuarios' },
    { codigo: 'USER_UPDATE', nombre: 'Actualizar Usuario', descripcion: 'Permite modificar usuarios', modulo: 'usuarios' },
    { codigo: 'USER_DELETE', nombre: 'Eliminar Usuario', descripcion: 'Permite eliminar usuarios', modulo: 'usuarios' },
    { codigo: 'ROLE_MANAGE', nombre: 'Gestionar Roles', descripcion: 'Permite gestionar roles', modulo: 'roles' },
    { codigo: 'INVENTORY_MANAGE', nombre: 'Gestionar Inventario', descripcion: 'Permite gestionar inventario', modulo: 'inventario' },
    { codigo: 'SALES_MANAGE', nombre: 'Gestionar Ventas', descripcion: 'Permite gestionar ventas', modulo: 'ventas' },
    { codigo: 'REPORTS_VIEW', nombre: 'Ver Reportes', descripcion: 'Permite ver reportes', modulo: 'reportes' },
    { codigo: 'PRESCRIPTIONS_MANAGE', nombre: 'Gestionar Recetas', descripcion: 'Permite gestionar recetas médicas', modulo: 'recetas' },
  ];
  
  // Create and save permissions
  const permissions = permissionRepository.create(permissionsData);
  return permissionRepository.save(permissions);
}

/**
 * Seed roles
 */
async function seedRoles(permissions: Permiso[]): Promise<Rol[]> {
  const roleRepository = AppDataSource.getRepository(Rol);
  
  // Clear existing roles
  await roleRepository.clear();
  
  // Get permission codes
  const permissionCodes = permissions.map(p => p.codigo);
  
  // Define roles
  const rolesData = [
    { 
      nombre: 'Administrador', 
      descripcion: 'Acceso completo al sistema', 
      permisos: permissionCodes,
      creadoPor: 'SISTEMA'
    },
    { 
      nombre: 'Farmacéutico', 
      descripcion: 'Gestión de recetas e inventario', 
      permisos: ['USER_READ', 'INVENTORY_MANAGE', 'PRESCRIPTIONS_MANAGE'],
      creadoPor: 'SISTEMA'
    },
    { 
      nombre: 'Cajero', 
      descripcion: 'Registro de ventas y transacciones', 
      permisos: ['USER_READ', 'SALES_MANAGE'],
      creadoPor: 'SISTEMA'
    },
    { 
      nombre: 'Vendedor', 
      descripcion: 'Atención a clientes', 
      permisos: ['USER_READ', 'SALES_MANAGE'],
      creadoPor: 'SISTEMA'
    },
    { 
      nombre: 'Admin Inventario', 
      descripcion: 'Gestión de inventario', 
      permisos: ['INVENTORY_MANAGE', 'REPORTS_VIEW'],
      creadoPor: 'SISTEMA'
    }
  ];
  
  // Create and save roles
  const roles = roleRepository.create(rolesData);
  return roleRepository.save(roles);
}

/**
 * Seed admin user
 */
async function seedAdminUser(permissions: string[]): Promise<Usuario> {
  const userRepository = AppDataSource.getRepository(Usuario);
  
  // Clear existing users 
  await userRepository.clear();
  
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = userRepository.create({
    rut: '11111111-1',
    nombres: 'Admin',
    apellidos: 'Sistema',
    fechaNacimiento: '1990-01-01',
    direccion: 'Calle Admin 123',
    comuna: 'Santiago',
    telefono: '+56911111111',
    email: 'admin@sistema.cl',
    activo: true,
    tipo: TipoUsuario.ADMIN,
    credenciales: {
      username: 'admin',
      passwordHash: hashedPassword,
      ultimoAcceso: new Date().toISOString(),
      intentosFallidos: 0,
      bloqueado: false
    },
    permisos: permissions
  });
  
  return userRepository.save(admin);
}

/**
 * Seed sample users of different types
 */
async function seedSampleUsers(): Promise<Usuario[]> {
  const userRepository = AppDataSource.getRepository(Usuario);
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const usersData = [
    {
      rut: '22222222-2',
      nombres: 'Juan',
      apellidos: 'Pérez',
      fechaNacimiento: '1985-05-15',
      direccion: 'Av. Principal 123',
      comuna: 'Providencia',
      telefono: '+56922222222',
      email: 'juan.perez@mail.cl',
      activo: true,
      tipo: TipoUsuario.FARMACEUTICO,
      credenciales: {
        username: 'farmaceutico',
        passwordHash: hashedPassword,
        ultimoAcceso: new Date().toISOString(),
        intentosFallidos: 0,
        bloqueado: false
      },
      permisos: ['USER_READ', 'INVENTORY_MANAGE', 'PRESCRIPTIONS_MANAGE']
    },
    {
      rut: '33333333-3',
      nombres: 'María',
      apellidos: 'González',
      fechaNacimiento: '1990-08-21',
      direccion: 'Los Alerces 456',
      comuna: 'Las Condes',
      telefono: '+56933333333',
      email: 'maria.gonzalez@mail.cl',
      activo: true,
      tipo: TipoUsuario.CAJERO,
      credenciales: {
        username: 'cajero',
        passwordHash: hashedPassword,
        ultimoAcceso: new Date().toISOString(),
        intentosFallidos: 0,
        bloqueado: false
      },
      permisos: ['USER_READ', 'SALES_MANAGE']
    },
    {
      rut: '44444444-4',
      nombres: 'Pedro',
      apellidos: 'Soto',
      fechaNacimiento: '1988-12-10',
      direccion: 'Pasaje Los Robles 789',
      comuna: 'Santiago',
      telefono: '+56944444444',
      email: 'pedro.soto@mail.cl',
      activo: true,
      tipo: TipoUsuario.VENDEDOR,
      credenciales: {
        username: 'vendedor',
        passwordHash: hashedPassword,
        ultimoAcceso: new Date().toISOString(),
        intentosFallidos: 0,
        bloqueado: false
      },
      permisos: ['USER_READ', 'SALES_MANAGE']
    },
    {
      rut: '55555555-5',
      nombres: 'Ana',
      apellidos: 'Muñoz',
      fechaNacimiento: '1992-03-25',
      direccion: 'Calle Las Flores 321',
      comuna: 'Ñuñoa',
      telefono: '+56955555555',
      email: 'ana.munoz@mail.cl',
      activo: true,
      tipo: TipoUsuario.ADMIN_INVENTARIO,
      credenciales: {
        username: 'inventario',
        passwordHash: hashedPassword,
        ultimoAcceso: new Date().toISOString(),
        intentosFallidos: 0,
        bloqueado: false
      },
      permisos: ['INVENTORY_MANAGE', 'REPORTS_VIEW']
    }
  ];
  
  const users = userRepository.create(usersData);
  return userRepository.save(users);
}

/**
 * Seed beneficiaries
 */
async function seedBeneficiaries(): Promise<Beneficiario[]> {
  const beneficiaryRepository = AppDataSource.getRepository(Beneficiario);
  const hashedPassword = await bcrypt.hash('beneficiario123', 10);
  
  const beneficiariesData = [
    {
      rut: '66666666-6',
      nombres: 'Luis',
      apellidos: 'Martínez',
      fechaNacimiento: '1970-11-05',
      direccion: 'Pasaje El Bosque 123',
      comuna: 'La Florida',
      telefono: '+56966666666',
      email: 'luis.martinez@mail.cl',
      activo: true,
      tipo: TipoUsuario.BENEFICIARIO,
      credenciales: {
        username: 'beneficiario1',
        passwordHash: hashedPassword,
        ultimoAcceso: new Date().toISOString(),
        intentosFallidos: 0,
        bloqueado: false
      },
      permisos: ['USER_READ'],
      categoriaDescuento: 'A',
      observacionesMedicas: 'Hipertensión, Diabetes tipo 2',
      recetas: [
        {
          id: '1',
          beneficiarioId: '66666666-6',
          medicoNombre: 'Dr. Carlos Ruiz',
          medicoRut: '12345678-9',
          fechaEmision: '2023-10-15',
          fechaVencimiento: '2023-12-15',
          productos: [
            {
              codigo: 'MED001',
              nombre: 'Metformina 850mg',
              cantidad: 60,
              indicaciones: 'Tomar 1 comprimido cada 12 horas',
              periodoDispensacion: 30
            },
            {
              codigo: 'MED002',
              nombre: 'Losartán 50mg',
              cantidad: 30,
              indicaciones: 'Tomar 1 comprimido cada 24 horas',
              periodoDispensacion: 30
            }
          ],
          activa: true
        }
      ],
      historialCompras: [
        {
          id: '1',
          fecha: new Date('2023-10-20'),
          producto: 'Metformina 850mg',
          cantidad: 60,
          total: 5000
        },
        {
          id: '2',
          fecha: new Date('2023-10-20'),
          producto: 'Losartán 50mg',
          cantidad: 30,
          total: 3000
        }
      ]
    },
    {
      rut: '77777777-7',
      nombres: 'Carmen',
      apellidos: 'Vega',
      fechaNacimiento: '1965-04-18',
      direccion: 'Av. Los Leones 456',
      comuna: 'Providencia',
      telefono: '+56977777777',
      email: 'carmen.vega@mail.cl',
      activo: true,
      tipo: TipoUsuario.BENEFICIARIO,
      credenciales: {
        username: 'beneficiario2',
        passwordHash: hashedPassword,
        ultimoAcceso: new Date().toISOString(),
        intentosFallidos: 0,
        bloqueado: false
      },
      permisos: ['USER_READ'],
      categoriaDescuento: 'B',
      observacionesMedicas: 'Artritis, Hipotiroidismo',
      recetas: [
        {
          id: '2',
          beneficiarioId: '77777777-7',
          medicoNombre: 'Dra. Laura Mendoza',
          medicoRut: '98765432-1',
          fechaEmision: '2023-11-01',
          fechaVencimiento: '2024-01-01',
          productos: [
            {
              codigo: 'MED003',
              nombre: 'Levotiroxina 50mcg',
              cantidad: 30,
              indicaciones: 'Tomar 1 comprimido en ayunas',
              periodoDispensacion: 30
            }
          ],
          activa: true
        }
      ],
      historialCompras: [
        {
          id: '3',
          fecha: new Date('2023-11-05'),
          producto: 'Levotiroxina 50mcg',
          cantidad: 30,
          total: 2500
        }
      ]
    }
  ];
  
  const beneficiaries = beneficiaryRepository.create(beneficiariesData);
  return beneficiaryRepository.save(beneficiaries);
}

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('Database seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error during database seeding:', error);
      process.exit(1);
    });
} 