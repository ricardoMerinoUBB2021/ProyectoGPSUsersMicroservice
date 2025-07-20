# Microservicio de Usuarios - SGA

Este microservicio gestiona toda la información relacionada con los usuarios del sistema de farmacias comunales, incluyendo beneficiarios (pacientes), administradores, farmacéuticos y otros roles operativos.

**Nota importante**: Este microservicio ya no maneja autenticación ni autorización. Todas las funciones de autorización han sido movidas al API Gateway. Para más información sobre los componentes de autorización, consulte la carpeta `/deprecated`.

## Nueva Estructura de Base de Datos

El proyecto ha sido actualizado para utilizar una nueva estructura de base de datos PostgreSQL que incluye:

### Entidades Principales

1. **Users** - Gestión de usuarios del sistema
   - `userid` (Primary Key, Auto-increment)
   - `username` (Unique)
   - `credentials` (Password hash)
   - `salt` (Salt para encriptación)

2. **Roles** - Roles de usuario
   - `roleid` (Primary Key, Auto-increment)
   - `rolename` (Unique)
   - `description`

3. **Permissions** - Permisos del sistema
   - `permissionsid` (Primary Key, Auto-increment)
   - `permissionname`
   - `description`

4. **Beneficiary** - Información de beneficiarios
   - `beneficiaryid` (Primary Key, Auto-increment)
   - `discountcategory`
   - `discount` (Real number)
   - `userid` (Foreign Key to Users)

5. **Person** - Información personal
   - `rut` (Primary Key)
   - `name`
   - `lastname`
   - `beneficiaryid` (Foreign Key to Beneficiary)

### Tablas de Relación

- **users_roles** - Relación muchos a muchos entre usuarios y roles
- **roles_permissions** - Relación muchos a muchos entre roles y permisos

## Roles de Usuario

1. **ADMIN** - Administrador con acceso completo
2. **FARMACEUTICO** - Farmacéutico con acceso limitado
3. **CAJERO** - Cajero con acceso a transacciones
4. **BENEFICIARIO** - Beneficiario con acceso básico

## Endpoints API

### Usuarios
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /api/usuarios | Obtener lista de usuarios (paginada) |
| GET | /api/usuarios/{id} | Obtener detalles de un usuario |
| POST | /api/usuarios | Crear nuevo usuario |
| PUT | /api/usuarios/{id} | Actualizar datos de un usuario |
| DELETE | /api/usuarios/{id} | Eliminar usuario |

### Roles
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /api/roles | Obtener todos los roles |
| GET | /api/roles/{id} | Obtener rol específico |
| POST | /api/roles | Crear nuevo rol |
| PUT | /api/roles/{id} | Actualizar rol |
| DELETE | /api/roles/{id} | Eliminar rol |

### Permisos
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /api/permissions | Obtener todos los permisos |
| GET | /api/permissions/{id} | Obtener permiso específico |
| POST | /api/permissions | Crear nuevo permiso |
| PUT | /api/permissions/{id} | Actualizar permiso |
| DELETE | /api/permissions/{id} | Eliminar permiso |

### Beneficiarios
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | /api/beneficiarios | Crear nuevo beneficiario |

## Configuración del Proyecto

### Variables de Entorno

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_username
DB_PASS=your_password
DB_NAME=your_database
NODE_ENV=development
```

### Instalación y Configuración

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Configurar base de datos**:
   ```bash
   # Ejecutar migraciones
   npm run migration:run
   
   # Poblar con datos iniciales
   npm run seed
   ```

3. **Ejecutar en desarrollo**:
   ```bash
   npm run dev
   ```

4. **Ejecutar en producción**:
   ```bash
   npm run build
   npm start
   ```

## Estructura del Proyecto

```
/src
  /controllers    # Controladores API
    - user.controller.ts
    - roles.controller.ts
    - permissions.controller.ts
  /entities       # Entidades TypeORM
    - user.entity.ts
    - role.entity.ts
    - permission.entity.ts
    - beneficiary.entity.ts
    - person.entity.ts
  /migrations     # Migraciones de base de datos
    - initial-schema.ts
  /services       # Lógica de negocio
    - user.service.ts
    - roles.service.ts
    - permissions.service.ts
  /routes         # Rutas de la API
    - user.routes.ts
    - roles.routes.ts
    - permissions.routes.ts
  /utils          # Funciones de utilidad
    - seed-database.ts
  /config         # Configuración
    - data-source.ts

/deprecated       # Componentes de autorización (para API Gateway)
  /middlewares    # Middlewares de autorización
  /controllers    # Controladores de autenticación
  /services       # Servicios de autenticación
  /routes         # Rutas de autenticación
  /test           # Tests de autorización
  README.md       # Documentación para API Gateway
```

## Integración con API Gateway

Este microservicio ahora funciona como un servicio puro de gestión de usuarios. El API Gateway es responsable de:

1. **Autenticación**: Verificación de JWT tokens
2. **Autorización**: Verificación de permisos y roles
3. **Forwarding**: Envío de información de usuario a través de headers

### Headers Esperados del API Gateway

El microservicio espera recibir información del usuario a través de headers cuando sea necesario:

- `X-User-ID`: ID del usuario autenticado
- `X-User-Roles`: Roles del usuario (separados por comas)
- `X-User-Permissions`: Permisos del usuario (separados por comas)

## Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Ejecutar en modo desarrollo
npm run build            # Compilar TypeScript
npm start                # Ejecutar en producción

# Base de datos
npm run migration:run    # Ejecutar migraciones
npm run migration:revert # Revertir última migración
npm run seed             # Poblar base de datos

# Testing
npm test                 # Ejecutar pruebas
```

## Consideraciones de Seguridad

- Encriptación de contraseñas con bcrypt y salt único
- Validación de entrada en todos los endpoints
- El microservicio confía en el API Gateway para la autorización

## Próximas Mejoras

1. **Validación de Headers**: Implementar validación de headers del API Gateway
2. **Logging**: Mejorar el sistema de logging para auditoría
3. **Caching**: Implementar cache para consultas frecuentes
4. **Documentación API**: Generar documentación automática de la API