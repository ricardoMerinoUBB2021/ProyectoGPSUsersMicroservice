-- Initialize PostgreSQL database for users-microservice

-- Drop tables if they exist (in reverse order of creation to handle dependencies)
DROP TABLE IF EXISTS beneficiarios;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS permisos;

-- Create tables
CREATE TABLE permisos (
    codigo VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    modulo VARCHAR(100) NOT NULL
);

CREATE TABLE roles (
    id UUID PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    permisos TEXT[], -- Array of permission codes
    creado_por VARCHAR(100) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE usuarios (
    id UUID PRIMARY KEY,
    rut VARCHAR(20) NOT NULL UNIQUE,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    direccion VARCHAR(200) NOT NULL,
    comuna VARCHAR(100) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,
    tipo VARCHAR(50) NOT NULL,
    credenciales JSONB NOT NULL, -- Stored as JSON with username, passwordHash, etc.
    permisos TEXT[] -- Array of permission codes
);

CREATE TABLE beneficiarios (
    id UUID PRIMARY KEY REFERENCES usuarios(id) ON DELETE CASCADE,
    categoria_descuento VARCHAR(100) NOT NULL,
    observaciones_medicas TEXT,
    recetas JSONB, -- Stored as JSON array
    historial_compras JSONB -- Stored as JSON array
);

-- Insert test data
-- Permissions
INSERT INTO permisos (codigo, nombre, descripcion, modulo) VALUES 
('USER_CREATE', 'Crear Usuario', 'Permite crear nuevos usuarios en el sistema', 'Usuarios'),
('USER_READ', 'Ver Usuario', 'Permite ver información de usuarios', 'Usuarios'),
('USER_UPDATE', 'Actualizar Usuario', 'Permite modificar información de usuarios', 'Usuarios'),
('USER_DELETE', 'Eliminar Usuario', 'Permite eliminar usuarios del sistema', 'Usuarios'),
('INVENTORY_READ', 'Ver Inventario', 'Permite consultar el inventario', 'Inventario'),
('INVENTORY_UPDATE', 'Actualizar Inventario', 'Permite modificar el inventario', 'Inventario'),
('SALES_CREATE', 'Crear Venta', 'Permite registrar ventas', 'Ventas'),
('SALES_READ', 'Ver Ventas', 'Permite consultar ventas', 'Ventas');

-- Roles
INSERT INTO roles (id, nombre, descripcion, permisos, creado_por)
VALUES 
('11111111-1111-1111-1111-111111111111', 'Administrador', 'Acceso completo al sistema', ARRAY['USER_CREATE', 'USER_READ', 'USER_UPDATE', 'USER_DELETE', 'INVENTORY_READ', 'INVENTORY_UPDATE', 'SALES_CREATE', 'SALES_READ'], 'sistema'),
('22222222-2222-2222-2222-222222222222', 'Farmacéutico', 'Gestión de ventas e inventario', ARRAY['USER_READ', 'INVENTORY_READ', 'INVENTORY_UPDATE', 'SALES_CREATE', 'SALES_READ'], 'sistema'),
('33333333-3333-3333-3333-333333333333', 'Cajero', 'Gestión de ventas', ARRAY['USER_READ', 'SALES_CREATE', 'SALES_READ'], 'sistema'),
('44444444-4444-4444-4444-444444444444', 'Beneficiario', 'Cliente del sistema', ARRAY['USER_READ'], 'sistema');

-- Users
INSERT INTO usuarios (id, rut, nombres, apellidos, fecha_nacimiento, direccion, comuna, telefono, email, tipo, credenciales, permisos)
VALUES 
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '12345678-9', 'Admin', 'Sistema', '1980-01-01', 'Av. Principal 123', 'Santiago', '912345678', 'admin@farmacia.cl', 'ADMIN', 
  '{"username": "admin", "passwordHash": "$2a$10$XHBLvh/GKQX0EChsX4o5ReZRlLhGm0vbBE1KPm7Oyk4n2gxZTZ9kK", "ultimoAcceso": "2023-05-01T08:30:00", "intentosFallidos": 0, "bloqueado": false}', 
  ARRAY['USER_CREATE', 'USER_READ', 'USER_UPDATE', 'USER_DELETE', 'INVENTORY_READ', 'INVENTORY_UPDATE', 'SALES_CREATE', 'SALES_READ']),

('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '87654321-0', 'Farmacia', 'Encargado', '1985-05-15', 'Calle Salud 456', 'Providencia', '987654321', 'farmaceutico@farmacia.cl', 'FARMACEUTICO', 
  '{"username": "farmaceutico", "passwordHash": "$2a$10$XHBLvh/GKQX0EChsX4o5ReZRlLhGm0vbBE1KPm7Oyk4n2gxZTZ9kK", "ultimoAcceso": "2023-05-01T09:15:00", "intentosFallidos": 0, "bloqueado": false}', 
  ARRAY['USER_READ', 'INVENTORY_READ', 'INVENTORY_UPDATE', 'SALES_CREATE', 'SALES_READ']),

('cccccccc-cccc-cccc-cccc-cccccccccccc', '11222333-4', 'Cajero', 'Ventas', '1990-10-20', 'Pasaje Comercio 789', 'Las Condes', '977889900', 'cajero@farmacia.cl', 'CAJERO', 
  '{"username": "cajero", "passwordHash": "$2a$10$XHBLvh/GKQX0EChsX4o5ReZRlLhGm0vbBE1KPm7Oyk4n2gxZTZ9kK", "ultimoAcceso": "2023-05-01T10:00:00", "intentosFallidos": 0, "bloqueado": false}', 
  ARRAY['USER_READ', 'SALES_CREATE', 'SALES_READ']),

('dddddddd-dddd-dddd-dddd-dddddddddddd', '22333444-5', 'Juan', 'Pérez', '1975-03-25', 'Av. Las Torres 1010', 'Ñuñoa', '966778899', 'juan.perez@email.com', 'BENEFICIARIO', 
  '{"username": "jperez", "passwordHash": "$2a$10$XHBLvh/GKQX0EChsX4o5ReZRlLhGm0vbBE1KPm7Oyk4n2gxZTZ9kK", "ultimoAcceso": "2023-05-01T11:30:00", "intentosFallidos": 0, "bloqueado": false}', 
  ARRAY['USER_READ']);

-- Beneficiaries
INSERT INTO beneficiarios (id, categoria_descuento, observaciones_medicas, recetas, historial_compras)
VALUES 
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Adulto Mayor', 'Hipertensión, Diabetes tipo 2', 
  '[
    {
      "id": "rec-123456",
      "beneficiarioId": "dddddddd-dddd-dddd-dddd-dddddddddddd",
      "medicoNombre": "Dr. Roberto Gómez",
      "medicoRut": "10123456-8",
      "fechaEmision": "2023-04-15",
      "fechaVencimiento": "2023-07-15",
      "productos": [
        {
          "codigo": "MED-001",
          "nombre": "Losartán 50mg",
          "cantidad": 30,
          "indicaciones": "1 comprimido cada 24 horas",
          "periodoDispensacion": 30
        },
        {
          "codigo": "MED-002",
          "nombre": "Metformina 850mg",
          "cantidad": 60,
          "indicaciones": "1 comprimido cada 12 horas",
          "periodoDispensacion": 30
        }
      ],
      "activa": true
    }
  ]',
  '[
    {
      "id": "comp-789012",
      "fecha": "2023-04-20T15:30:00",
      "producto": "Losartán 50mg",
      "cantidad": 30,
      "total": 12000
    },
    {
      "id": "comp-789013",
      "fecha": "2023-04-20T15:30:00",
      "producto": "Metformina 850mg",
      "cantidad": 60,
      "total": 15000
    }
  ]'
);

-- Create index for improved query performance
CREATE INDEX idx_usuarios_rut ON usuarios(rut);
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_tipo ON usuarios(tipo);
CREATE INDEX idx_roles_nombre ON roles(nombre); 