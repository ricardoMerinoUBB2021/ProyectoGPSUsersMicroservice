# Postman Collection for Users Microservice

## Base URL
```
http://localhost:3002/api
```

## Authentication
Most endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Public Endpoints (No Authentication Required)

### 1. User Registration
**POST** `/auth/register`

Create a new user account (no authentication required).

**Request Body:**
```json
{
  "username": "newuser",
  "credentials": "password123"
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "message": "Usuario registrado exitosamente",
  "data": {
    "user": {
      "userId": 1,
      "username": "newuser"
    }
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "status": "error",
  "message": "Se requiere nombre de usuario y contraseña"
}
```

### 2. User Login
**POST** `/auth/login`

Authenticate user and get access token.

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Inicio de sesión exitoso",
  "data": {
    "user": {
      "userId": 1,
      "username": "admin",
      "roles": [
        {
          "roleId": 1,
          "roleName": "ADMIN",
          "description": "Administrator with full access",
          "permissions": [
            {
              "permissionsId": 1,
              "permissionName": "user:read",
              "description": "Read user information"
            }
          ]
        }
      ],
      "beneficiary": null
    }
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "status": "error",
  "message": "Usuario o contraseña incorrectos"
}
```

## Protected Endpoints (Authentication Required)

### 3. Get User Profile
**GET** `/auth/perfil`

Get current user profile information.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "userId": 1
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "profile": {
      "userId": 1,
      "username": "admin",
      "roles": [...],
      "beneficiary": {...}
    }
  }
}
```

### 4. Change Password
**POST** `/auth/cambiar-clave`

Change user password.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "userId": 1,
  "currentPassword": "oldpassword",
  "newPassword": "newpassword"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Contraseña actualizada exitosamente"
}
```

## User Management Endpoints

### 5. Get All Users (Public - No Auth Required)
**GET** `/usuarios?page=1&limit=10`

Get paginated list of users.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "users": [
      {
        "userId": 1,
        "username": "admin",
        "roles": [...],
        "beneficiary": {...}
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "pages": 1
    }
  }
}
```

### 6. Get User by ID (Public - No Auth Required)
**GET** `/usuarios/:id`

Get specific user by ID.

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "user": {
      "userId": 1,
      "username": "admin",
      "roles": [...],
      "beneficiary": {...}
    }
  }
}
```

### 7. Create User (Public - No Auth Required)
**POST** `/usuarios`

Create a new user.

**Request Body:**
```json
{
  "username": "newuser",
  "credentials": "password123"
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "message": "Usuario creado exitosamente",
  "data": {
    "user": {
      "userId": 2,
      "username": "newuser",
      "roles": [],
      "beneficiary": null
    }
  }
}
```

### 8. Update User (Public - No Auth Required)
**PUT** `/usuarios/:id`

Update existing user.

**Request Body:**
```json
{
  "username": "updateduser"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Usuario actualizado exitosamente",
  "data": {
    "user": {
      "userId": 1,
      "username": "updateduser",
      "roles": [...],
      "beneficiary": {...}
    }
  }
}
```

### 9. Delete User (Public - No Auth Required)
**DELETE** `/usuarios/:id`

Delete user by ID.

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Usuario eliminado exitosamente"
}
```

## Beneficiary Management

### 10. Create Beneficiary (Public - No Auth Required)
**POST** `/beneficiarios`

Create a new beneficiary with associated user.

**Request Body:**
```json
{
  "username": "beneficiary",
  "credentials": "password123",
  "discountCategory": "GENERAL",
  "discount": 0.1
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "message": "Beneficiario creado exitosamente",
  "data": {
    "beneficiary": {
      "beneficiaryId": 1,
      "discountCategory": "GENERAL",
      "discount": 0.1,
      "user": {
        "userId": 2,
        "username": "beneficiary"
      }
    }
  }
}
```

## Role Management

### 11. Get All Roles (Public - No Auth Required)
**GET** `/roles`

Get all available roles.

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "roles": [
      {
        "roleId": 1,
        "roleName": "ADMIN",
        "description": "Administrator with full access",
        "permissions": [...]
      }
    ]
  }
}
```

### 12. Create Role (Public - No Auth Required)
**POST** `/roles`

Create a new role.

**Request Body:**
```json
{
  "roleName": "NEW_ROLE",
  "description": "New role description"
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "message": "Rol creado exitosamente",
  "data": {
    "role": {
      "roleId": 2,
      "roleName": "NEW_ROLE",
      "description": "New role description",
      "permissions": []
    }
  }
}
```

### 13. Update Role (Public - No Auth Required)
**PUT** `/roles/:id`

Update existing role.

**Request Body:**
```json
{
  "roleName": "UPDATED_ROLE"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Rol actualizado exitosamente",
  "data": {
    "role": {
      "roleId": 1,
      "roleName": "UPDATED_ROLE",
      "description": "Updated role description",
      "permissions": []
    }
  }
}
```

### 14. Delete Role (Public - No Auth Required)
**DELETE** `/roles/:id`

Delete role by ID.

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Rol eliminado exitosamente"
}
```

## Permission Management

### 15. Get All Permissions (Public - No Auth Required)
**GET** `/permisos`

Get all available permissions.

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "permissions": [
      {
        "permissionsId": 1,
        "permissionName": "user:read",
        "description": "Read user information"
      }
    ]
  }
}
```

## Error Responses

### Common Error Formats

**400 Bad Request:**
```json
{
  "status": "error",
  "message": "Error description"
}
```

**401 Unauthorized:**
```json
{
  "status": "error",
  "message": "Token de autenticación requerido"
}
```

**403 Forbidden:**
```json
{
  "status": "error",
  "message": "No tiene permisos para acceder a este recurso"
}
```

**404 Not Found:**
```json
{
  "status": "error",
  "message": "Usuario no encontrado"
}
```

**500 Internal Server Error:**
```json
{
  "status": "error",
  "message": "Error en el servidor",
  "error": "Detailed error message"
}
```

## Testing Scenarios

### 1. User Registration Flow
1. Register new user: `POST /auth/register`
2. Login with credentials: `POST /auth/login`
3. Get user profile: `GET /auth/perfil`

### 2. User Management Flow
1. Create user: `POST /usuarios`
2. Get all users: `GET /usuarios`
3. Get specific user: `GET /usuarios/:id`
4. Update user: `PUT /usuarios/:id`
5. Delete user: `DELETE /usuarios/:id`

### 3. Beneficiary Management Flow
1. Create beneficiary: `POST /beneficiarios`
2. Verify user and beneficiary creation

### 4. Role and Permission Management Flow
1. Get all roles: `GET /roles`
2. Create new role: `POST /roles`
3. Update role: `PUT /roles/:id`
4. Delete role: `DELETE /roles/:id`
5. Get all permissions: `GET /permisos`

## Notes

- **Public Endpoints**: User registration, login, and most CRUD operations are now public and don't require authentication
- **Protected Endpoints**: Only profile access and password changes require authentication
- **JWT Tokens**: Currently the JWT verification is a placeholder - implement actual JWT logic for production
- **Error Handling**: All endpoints return consistent error formats
- **Validation**: Basic input validation is implemented for required fields 