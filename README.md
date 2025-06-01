# Microservicio de Usuarios - SGA

Este microservicio gestiona toda la información relacionada con los usuarios del sistema de farmacias comunales, incluyendo beneficiarios (pacientes), administradores, farmacéuticos y otros roles operativos.

## Mejoras de Implementación

### Migración a TypeORM

- **Eliminación de la carpeta `repositories`**: Se eliminará la implementación actual basada en repositorios personalizados.
- **Implementación con TypeORM**: Se utilizará TypeORM para gestionar la conexión a base de datos y todas las consultas.
- **Ventajas**:
  - Gestión simplificada de entidades y relaciones
  - Migraciones automáticas de esquemas
  - Consultas más mantenibles y tipadas
  - Mejor rendimiento y optimización de consultas

### Transformación a Microservicio de Usuarios

El microservicio ya no se limitará a beneficiarios, sino que gestionará todos los tipos de usuarios:
- Beneficiarios (pacientes)
- Administradores
- Farmacéuticos
- Cajeros
- Vendedores

### Implementación de Perfiles y Privilegios

#### Roles de usuario

1. **Beneficiarios**
   - Consulta de su historial médico y de dispensación
   - Verificación de recetas y prescripciones disponibles
   - Consulta de beneficios y descuentos aplicables

2. **Cajeros**
   - Registro de ventas y transacciones
   - Aplicación de descuentos por categoría
   - Consulta limitada de datos de beneficiarios

3. **Vendedores**
   - Atención a clientes y beneficiarios
   - Consulta de inventario y disponibilidad
   - Registro de pedidos y solicitudes

4. **Administradores de Inventario**
   - Gestión completa del inventario
   - Control de stock y alertas de abastecimiento
   - Generación de órdenes de compra
   - Informes de movimiento de productos

5. **Administrador General**
   - Gestión completa de usuarios
   - Configuración de roles y privilegios
   - Acceso a todas las funcionalidades del sistema
   - Reportes generales y análisis del negocio

#### Sistema de Privilegios

- Sistema configurable por el Administrador General
- Matriz de permisos por rol
- Posibilidad de personalizar permisos específicos para usuarios individuales
- Registro de auditoría sobre cambios en permisos

## Nuevo Modelo de Datos

```typescript
interface Usuario {
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
  tipo: TipoUsuario; // 'BENEFICIARIO', 'ADMIN', 'FARMACEUTICO', 'CAJERO', 'VENDEDOR', 'ADMIN_INVENTARIO'
  credenciales: {
    username: string;
    passwordHash: string;
    ultimoAcceso: string;
    intentosFallidos: number;
    bloqueado: boolean;
  };
  permisos: string[]; // Array de códigos de permiso
}

interface Beneficiario extends Usuario {
  categoriaDescuento: string;
  observacionesMedicas: string;
  recetas: Receta[];
  historialCompras: HistorialCompra[];
}

interface Permiso {
  codigo: string;
  nombre: string;
  descripcion: string;
  modulo: string;
}

interface Rol {
  id: string;
  nombre: string;
  descripcion: string;
  permisos: string[]; // Array de códigos de permiso
  creadoPor: string;
  fechaCreacion: string;
}
```

## Endpoints API

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /usuarios | Obtener lista de usuarios (paginada) |
| GET | /usuarios/{id} | Obtener detalles de un usuario |
| POST | /usuarios | Crear nuevo usuario |
| PUT | /usuarios/{id} | Actualizar datos de un usuario |
| DELETE | /usuarios/{id} | Eliminar usuario (baja lógica) |
| GET | /roles | Obtener todos los roles disponibles |
| POST | /roles | Crear nuevo rol |
| PUT | /roles/{id} | Actualizar un rol |
| DELETE | /roles/{id} | Eliminar un rol |
| GET | /permisos | Obtener todos los permisos del sistema |
| POST | /auth/login | Autenticación de usuarios |
| GET | /auth/perfil | Obtener información del perfil actual |
| POST | /auth/cambiar-clave | Cambiar contraseña |
| GET | /beneficiarios/{id}/historial | Obtener historial de compras del beneficiario |
| GET | /beneficiarios/{id}/recetas | Obtener recetas activas del beneficiario |

## Implementación con TypeORM

### Estructura de carpetas propuesta

```
/src
  /controllers    # Controladores API
  /entities       # Entidades TypeORM
  /migrations     # Migraciones de base de datos
  /services       # Lógica de negocio
  /middlewares    # Middleware de autenticación y autorización
  /utils          # Funciones de utilidad
  /config         # Configuración de la aplicación
```

### Configuración de TypeORM

```typescript
// ormconfig.ts
export default {
  type: 'mysql', // o postgres, dependiendo de la base de datos a utilizar
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  synchronize: false, // Usar migraciones en producción
  logging: process.env.NODE_ENV === 'development',
  entities: ['src/entities/**/*.ts'],
  migrations: ['src/migrations/**/*.ts'],
  subscribers: ['src/subscribers/**/*.ts'],
  cli: {
    entitiesDir: 'src/entities',
    migrationsDir: 'src/migrations',
    subscribersDir: 'src/subscribers',
  }
};
```

## Gestión de roles y privilegios

### Matriz de Privilegios

El sistema implementará una matriz dinámica de privilegios que el Administrador General podrá configurar:

1. **Asignación basada en roles**:
   - Cada usuario tiene asignado un rol principal
   - Los permisos se heredan del rol asignado

2. **Personalización individual**:
   - Posibilidad de otorgar/revocar permisos específicos a nivel de usuario
   - Override de permisos heredados del rol

3. **Auditoría de cambios**:
   - Registro de todas las modificaciones de permisos
   - Trazabilidad de quién realizó cada cambio

## Pasos de implementación

1. **Configuración del entorno de desarrollo**:
   ```bash
   npm install typeorm reflect-metadata mysql2 # o pg para PostgreSQL
   ```

2. **Crear entidades**:
   - Definir las entidades Usuario, Rol, Permiso, etc.
   - Establecer relaciones entre ellas

3. **Configurar conexión TypeORM**:
   - Crear archivo de configuración
   - Integrar en la aplicación

4. **Migrar datos existentes**:
   - Crear scripts de migración para datos de beneficiarios
   - Verificar integridad de datos migrados

5. **Implementar módulo de autenticación**:
   - JWT o sistema de tokens similar
   - Middleware de verificación de permisos

6. **Crear interface de gestión de usuarios y permisos**:
   - Vistas específicas para el Administrador General
   - Formularios de asignación de permisos

## Consideraciones de seguridad

- Implementación de hash seguro de contraseñas (bcrypt)
- Tokens JWT con tiempo de expiración adecuado
- Verificación de permisos en cada endpoint
- Registro de actividad para auditoría
- Protección contra ataques de fuerza bruta

## Pruebas

1. **Pruebas unitarias** para servicios y controladores
2. **Pruebas de integración** para verificar interacción con base de datos
3. **Pruebas de autorización** para verificar matriz de permisos
4. **Pruebas de rendimiento** para validar eficiencia de consultas TypeORM

# Users Microservice

This service handles user management functionality for the application.

## Deployment Pipeline

The microservice uses a clear separation of concerns between CI (Continuous Integration) and CD (Continuous Deployment):

### CI Pipeline (GitHub Actions)

The GitHub Actions workflow handles:
- Building and testing the application code
- Building the Docker image
- Pushing the image to GitHub Container Registry (ghcr.io)
- Triggering the CD pipeline in Jenkins

The workflow is triggered when:
- Code is pushed to the `main` branch
- A new release is published
- The workflow is manually triggered

Images are tagged with:
- `latest` for the default branch
- Semantic version tags when releases are published

### CD Pipeline (Jenkins)

The Jenkins pipeline focuses exclusively on deployment to an EC2 instance:
1. Pulls the pre-built Docker image from GitHub Packages on the EC2 instance
2. Stops and removes any existing container with the same name
3. Runs the new container with appropriate port mappings
4. Verifies the container is running successfully
5. Cleans up old Docker images to free up disk space

This approach:
- Deploys directly to an existing EC2 instance via SSH
- Ensures zero downtime by properly handling container replacement
- Maintains a clean environment by removing outdated images
- Provides immediate verification of deployment success

## Required Jenkins Credentials

The following credentials must be configured in Jenkins:
- `GITHUB_TOKEN` - GitHub Personal Access Token with packages read permissions
- `GITHUB_USERNAME` - GitHub username
- `GITHUB_REPO` - GitHub repository name
- `EC2_HOST` - Hostname or IP address of the EC2 instance
- `EC2_USER` - SSH username for the EC2 instance
- `EC2_SSH_KEY` - SSH private key for accessing the EC2 instance

## Local Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Start the service
npm start
```

## Docker

```bash
# Build the image
docker build -t users-microservice .

# Run the container
docker run -p 3001:3001 users-microservice
```

## Environment Configuration

| Variable               | Description                                    | Default Value         |
|------------------------|------------------------------------------------|-----------------------|
| NODE_ENV               | Environment (development, production, test)    | development           |
| PORT                   | Port number for the service                    | 3001                  |
| API_PREFIX             | API route prefix                               | /api/v1               |
| DB_HOST                | PostgreSQL host                                | localhost             |
| DB_PORT                | PostgreSQL port                                | 5432                  |
| DB_USER                | PostgreSQL username                            | postgres              |
| DB_PASS                | PostgreSQL password                            | postgres              |
| DB_NAME                | PostgreSQL database name                       | users_microservice    |
| JWT_SECRET             | Secret for JWT token generation                | -                     |
| JWT_EXPIRATION         | JWT token expiration time                      | 24h                   |
| REFRESH_TOKEN_SECRET   | Secret for refresh token generation            | -                     |
| REFRESH_TOKEN_EXPIRATION| Refresh token expiration time                 | 7d                    |