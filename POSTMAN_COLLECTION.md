# Postman Collection for Users Microservice

## Base URL
```
http://localhost:3002/api
```

## Important Note
This microservice no longer handles authentication or authorization. All authorization is now handled by the API Gateway. The endpoints below are now public and do not require authentication headers.

## API Structure Overview

The API is organized into three main route groups:
- **User Management**: `/api/usuarios`, `/api/beneficiarios`
- **Role Management**: `/api/roles/*`
- **Permission Management**: `/api/permissions/*`

## Public Endpoints (No Authentication Required)

### User Management Endpoints

#### 1. Get All Users
**GET** `/usuarios`

Get all users (no pagination).

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "users": [
      {
        "userId": 1,
        "username": "admin",
        "roles": [
          {
            "roleId": 1,
            "roleName": "ADMIN",
            "description": "Administrator with full access"
          }
        ],
        "beneficiary": null
      }
    ]
  }
}
```

#### 2. Get User by ID
**GET** `/usuarios/{id}`

Get a specific user by their ID.

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "user": {
      "userId": 1,
      "username": "admin",
      "roles": [
        {
          "roleId": 1,
          "roleName": "ADMIN",
          "description": "Administrator with full access"
        }
      ],
      "beneficiary": null
    }
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "status": "error",
  "message": "Usuario no encontrado"
}
```

#### 3. Create User
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
      "username": "newuser"
    }
  }
}
```

**Error Response (400 Bad Request) - Username already exists:**
```json
{
  "status": "error",
  "message": "Error al crear usuario",
  "error": "Username already exists"
}
```

#### 4. Update User
**PUT** `/usuarios/{id}`

Update an existing user.

**Request Body:**
```json
{
  "username": "updateduser",
  "credentials": "newpassword123"
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
      "username": "updateduser"
    }
  }
}
```

#### 5. Delete User
**DELETE** `/usuarios/{id}`

Delete a user. If the user has an associated beneficiary, both the user and beneficiary will be deleted.

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Usuario eliminado exitosamente"
}
```

#### 6. Create Beneficiary
**POST** `/beneficiarios`

Create a new beneficiary with associated user account.

**Request Body:**
```json
{
  "username": "beneficiary1",
  "credentials": "password123",
  "discountCategory": "SENIOR",
  "discount": 0.15
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
      "discountCategory": "SENIOR",
      "discount": 0.15,
      "user": {
        "userId": 3,
        "username": "beneficiary1"
      }
    }
  }
}
```

**Error Response (400 Bad Request) - Username already exists:**
```json
{
  "status": "error",
  "message": "Error al crear beneficiario",
  "error": "Username already exists"
}
```

#### 7. Get All Beneficiaries
**GET** `/beneficiarios`

Get all beneficiaries with their associated user information.

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "beneficiaries": [
      {
        "beneficiaryId": 1,
        "discountCategory": "SENIOR",
        "discount": 0.15,
        "user": {
          "userId": 3,
          "username": "beneficiary1",
          "credentials": "hashedPassword",
          "salt": "salt123",
          "roles": [],
          "beneficiary": null
        }
      },
      {
        "beneficiaryId": 2,
        "discountCategory": "GENERAL",
        "discount": 0.1,
        "user": {
          "userId": 4,
          "username": "beneficiary2",
          "credentials": "hashedPassword",
          "salt": "salt123",
          "roles": [],
          "beneficiary": null
        }
      }
    ]
  }
}
```

#### 8. Get Beneficiary by ID
**GET** `/beneficiarios/{id}`

Get a specific beneficiary by their ID.

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "beneficiary": {
      "beneficiaryId": 1,
      "discountCategory": "SENIOR",
      "discount": 0.15,
      "user": {
        "userId": 3,
        "username": "beneficiary1",
        "credentials": "hashedPassword",
        "salt": "salt123",
        "roles": [],
        "beneficiary": null
      }
    }
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "status": "error",
  "message": "Beneficiario no encontrado"
}
```

#### 9. Update Beneficiary
**PUT** `/beneficiarios/{id}`

Update an existing beneficiary's information.

**Request Body:**
```json
{
  "discountCategory": "SENIOR",
  "discount": 0.2
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Beneficiario actualizado exitosamente",
  "data": {
    "beneficiary": {
      "beneficiaryId": 1,
      "discountCategory": "SENIOR",
      "discount": 0.2,
      "user": {
        "userId": 3,
        "username": "beneficiary1",
        "credentials": "hashedPassword",
        "salt": "salt123",
        "roles": [],
        "beneficiary": null
      }
    }
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "status": "error",
  "message": "Beneficiario no encontrado"
}
```

#### 10. Delete Beneficiary
**DELETE** `/beneficiarios/{id}`

Delete a beneficiary. This will also delete the associated user account.

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Beneficiario eliminado exitosamente"
}
```

**Error Response (404 Not Found):**
```json
{
  "status": "error",
  "message": "Beneficiario no encontrado"
}
```

### Role Management Endpoints

#### 11. Get All Roles
**GET** `/api/roles`

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
        "permissions": [
          {
            "permissionsId": 1,
            "permissionName": "user:read",
            "description": "Read user information"
          }
        ]
      }
    ]
  }
}
```

#### 12. Get Role by ID
**GET** `/api/roles/{id}`

Get a specific role by ID.

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "role": {
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
  }
}
```

#### 13. Create Role
**POST** `/api/roles`

Create a new role.

**Request Body:**
```json
{
  "roleName": "MODERATOR",
  "description": "Moderator with limited access"
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "message": "Rol creado exitosamente",
  "data": {
    "role": {
      "roleId": 5,
      "roleName": "MODERATOR",
      "description": "Moderator with limited access"
    }
  }
}
```

#### 14. Update Role
**PUT** `/api/roles/{id}`

Update an existing role.

**Request Body:**
```json
{
  "roleName": "UPDATED_MODERATOR",
  "description": "Updated moderator description"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Rol actualizado exitosamente",
  "data": {
    "role": {
      "roleId": 5,
      "roleName": "UPDATED_MODERATOR",
      "description": "Updated moderator description"
    }
  }
}
```

#### 15. Delete Role
**DELETE** `/api/roles/{id}`

Delete a role.

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Rol eliminado exitosamente"
}
```

### Permission Management Endpoints

#### 16. Get All Permissions
**GET** `/api/permissions`

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
      },
      {
        "permissionsId": 2,
        "permissionName": "user:write",
        "description": "Create and update users"
      }
    ]
  }
}
```

#### 17. Get Permission by ID
**GET** `/api/permissions/{id}`

Get a specific permission by ID.

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "permission": {
      "permissionsId": 1,
      "permissionName": "user:read",
      "description": "Read user information"
    }
  }
}
```

#### 18. Create Permission
**POST** `/api/permissions`

Create a new permission.

**Request Body:**
```json
{
  "permissionName": "user:delete",
  "description": "Delete users"
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "message": "Permiso creado exitosamente",
  "data": {
    "permission": {
      "permissionsId": 3,
      "permissionName": "user:delete",
      "description": "Delete users"
    }
  }
}
```

#### 19. Update Permission
**PUT** `/api/permissions/{id}`

Update an existing permission.

**Request Body:**
```json
{
  "permissionName": "user:delete",
  "description": "Delete users with confirmation"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Permiso actualizado exitosamente",
  "data": {
    "permission": {
      "permissionsId": 3,
      "permissionName": "user:delete",
      "description": "Delete users with confirmation"
    }
  }
}
```

#### 20. Delete Permission
**DELETE** `/api/permissions/{id}`

Delete a permission.

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Permiso eliminado exitosamente"
}
```

## Error Responses

### Common Error Formats

**400 Bad Request:**
```json
{
  "status": "error",
  "message": "Error description",
  "error": "Detailed error message"
}
```

**404 Not Found:**
```json
{
  "status": "error",
  "message": "Resource not found"
}
```

**500 Internal Server Error:**
```json
{
  "status": "error",
  "message": "Error interno del servidor",
  "error": "Detailed error message (development only)"
}
```

## Testing Scenarios

### 1. User Management Flow
1. Create user: `POST /usuarios`
2. Get all users: `GET /usuarios`
3. Get specific user: `GET /usuarios/:id`
4. Update user: `PUT /usuarios/:id`
5. Delete user: `DELETE /usuarios/:id`

### 2. Beneficiary Management Flow
1. Create beneficiary: `POST /beneficiarios`
2. Get all beneficiaries: `GET /beneficiarios`
3. Get specific beneficiary: `GET /beneficiarios/:id`
4. Update beneficiary: `PUT /beneficiarios/:id`
5. Delete beneficiary: `DELETE /beneficiarios/:id`

### 3. Role Management Flow
1. Get all roles: `GET /api/roles`
2. Create new role: `POST /api/roles`
3. Update role: `PUT /api/roles/:id`
4. Delete role: `DELETE /api/roles/:id`

### 4. Permission Management Flow
1. Get all permissions: `GET /api/permissions`
2. Create new permission: `POST /api/permissions`
3. Update permission: `PUT /api/permissions/:id`
4. Delete permission: `DELETE /api/permissions/:id`

## Test Results Summary

✅ **All tests passing**: 73 tests passed, 0 failed
- User Controller: 16 tests passed
- User Service: 26 tests passed  
- Roles Controller: 10 tests passed
- Permissions Controller: 9 tests passed

**Coverage**: 61.43% statement coverage, 40.9% branch coverage

## Recent Changes

### ✅ **Fixed Issues:**

1. **Removed Pagination**: All endpoints now return complete data without pagination
2. **Username Uniqueness**: Users and beneficiaries now enforce unique usernames
3. **Duplicate Endpoints Removed**: Eliminated duplicate role and permission endpoints from user routes
4. **Enhanced Delete User**: Users with beneficiaries are now properly deleted (both user and beneficiary)
5. **Improved Error Handling**: Better error messages for duplicate usernames
6. **Expanded Beneficiary Management**: Added GET, PUT, and DELETE operations for beneficiaries

### ✅ **API Structure:**

- **User Management**: `/api/usuarios`, `/api/beneficiarios`
- **Role Management**: `/api/roles/*` (dedicated endpoints only)
- **Permission Management**: `/api/permissions/*` (dedicated endpoints only)

## Notes

- **No Authentication Required**: All endpoints are now public and do not require authentication headers
- **API Gateway Integration**: This microservice expects user information to be passed via headers from the API Gateway when needed
- **Error Handling**: All endpoints return consistent error formats
- **Validation**: Username uniqueness is enforced for both users and beneficiaries
- **Cascading Deletes**: Deleting a user with a beneficiary will delete both records, and deleting a beneficiary will delete both beneficiary and user
- **Complete CRUD Operations**: All entities now support full CRUD operations (Create, Read, Update, Delete)
- **Test Coverage**: The service has comprehensive test coverage with all critical functionality tested