# Postman Collection - Users Microservice API

This document contains all the API endpoints for testing the Users Microservice. You can import these requests into Postman or use them as a reference for testing.

## Base URL
```
http://localhost:3002
```

## Environment Variables
Set up these environment variables in Postman:
- `baseUrl`: `http://localhost:3002`
- `authToken`: (will be set after login)

---

## 1. Authentication Endpoints

### 1.1 Login User
**POST** `{{baseUrl}}/api/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Expected Response (200):**
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
          "permissions": [
            {
              "permissionsId": 1,
              "permissionName": "user:read"
            }
          ]
        }
      ],
      "beneficiary": null
    }
  }
}
```

**Test Script:**
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    if (response.data && response.data.user) {
        pm.environment.set("authToken", "Bearer " + response.data.user.userId);
    }
}
```

### 1.2 Get User Profile
**GET** `{{baseUrl}}/api/auth/perfil`

**Headers:**
```
Authorization: {{authToken}}
Content-Type: application/json
```

**Expected Response (200):**
```json
{
  "status": "success",
  "data": {
    "user": {
      "userId": 1,
      "username": "admin",
      "roles": [...],
      "beneficiary": null
    }
  }
}
```

### 1.3 Change Password
**POST** `{{baseUrl}}/api/auth/cambiar-clave`

**Headers:**
```
Authorization: {{authToken}}
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "currentPassword": "admin123",
  "newPassword": "newpassword123"
}
```

**Expected Response (200):**
```json
{
  "status": "success",
  "message": "Contraseña cambiada exitosamente"
}
```

---

## 2. User Management Endpoints

### 2.1 Get All Users (Paginated)
**GET** `{{baseUrl}}/api/usuarios?page=1&limit=10`

**Headers:**
```
Authorization: {{authToken}}
Content-Type: application/json
```

**Expected Response (200):**
```json
{
  "status": "success",
  "data": {
    "users": [
      {
        "userId": 1,
        "username": "admin",
        "roles": [...],
        "beneficiary": null
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

### 2.2 Get User by ID
**GET** `{{baseUrl}}/api/usuarios/1`

**Headers:**
```
Authorization: {{authToken}}
Content-Type: application/json
```

**Expected Response (200):**
```json
{
  "status": "success",
  "data": {
    "user": {
      "userId": 1,
      "username": "admin",
      "roles": [...],
      "beneficiary": null
    }
  }
}
```

### 2.3 Create New User
**POST** `{{baseUrl}}/api/usuarios`

**Headers:**
```
Authorization: {{authToken}}
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "username": "newuser",
  "credentials": "password123"
}
```

**Expected Response (201):**
```json
{
  "status": "success",
  "message": "Usuario creado exitosamente",
  "data": {
    "user": {
      "userId": 2,
      "username": "newuser",
      "credentials": "hashedPassword",
      "salt": "salt123"
    }
  }
}
```

### 2.4 Update User
**PUT** `{{baseUrl}}/api/usuarios/2`

**Headers:**
```
Authorization: {{authToken}}
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "username": "updateduser"
}
```

**Expected Response (200):**
```json
{
  "status": "success",
  "message": "Usuario actualizado exitosamente",
  "data": {
    "user": {
      "userId": 2,
      "username": "updateduser",
      "credentials": "hashedPassword",
      "salt": "salt123"
    }
  }
}
```

### 2.5 Delete User
**DELETE** `{{baseUrl}}/api/usuarios/2`

**Headers:**
```
Authorization: {{authToken}}
Content-Type: application/json
```

**Expected Response (200):**
```json
{
  "status": "success",
  "message": "Usuario eliminado exitosamente"
}
```

---

## 3. Role Management Endpoints

### 3.1 Get All Roles
**GET** `{{baseUrl}}/api/roles`

**Headers:**
```
Authorization: {{authToken}}
Content-Type: application/json
```

**Expected Response (200):**
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
      },
      {
        "roleId": 2,
        "roleName": "FARMACEUTICO",
        "description": "Pharmacist with limited access",
        "permissions": [...]
      }
    ]
  }
}
```

### 3.2 Get Role by ID
**GET** `{{baseUrl}}/api/roles/1`

**Headers:**
```
Authorization: {{authToken}}
Content-Type: application/json
```

**Expected Response (200):**
```json
{
  "status": "success",
  "data": {
    "role": {
      "roleId": 1,
      "roleName": "ADMIN",
      "description": "Administrator with full access",
      "permissions": [...]
    }
  }
}
```

### 3.3 Create New Role
**POST** `{{baseUrl}}/api/roles`

**Headers:**
```
Authorization: {{authToken}}
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "roleName": "MODERATOR",
  "description": "Moderator with limited admin access"
}
```

**Expected Response (201):**
```json
{
  "status": "success",
  "message": "Rol creado exitosamente",
  "data": {
    "role": {
      "roleId": 3,
      "roleName": "MODERATOR",
      "description": "Moderator with limited admin access",
      "permissions": []
    }
  }
}
```

### 3.4 Update Role
**PUT** `{{baseUrl}}/api/roles/3`

**Headers:**
```
Authorization: {{authToken}}
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "roleName": "SENIOR_MODERATOR",
  "description": "Senior moderator with extended access"
}
```

**Expected Response (200):**
```json
{
  "status": "success",
  "message": "Rol actualizado exitosamente",
  "data": {
    "role": {
      "roleId": 3,
      "roleName": "SENIOR_MODERATOR",
      "description": "Senior moderator with extended access",
      "permissions": []
    }
  }
}
```

### 3.5 Delete Role
**DELETE** `{{baseUrl}}/api/roles/3`

**Headers:**
```
Authorization: {{authToken}}
Content-Type: application/json
```

**Expected Response (200):**
```json
{
  "status": "success",
  "message": "Rol eliminado exitosamente"
}
```

---

## 4. Permission Management Endpoints

### 4.1 Get All Permissions
**GET** `{{baseUrl}}/api/permissions`

**Headers:**
```
Authorization: {{authToken}}
Content-Type: application/json
```

**Expected Response (200):**
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

### 4.2 Get Permission by ID
**GET** `{{baseUrl}}/api/permissions/1`

**Headers:**
```
Authorization: {{authToken}}
Content-Type: application/json
```

**Expected Response (200):**
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

### 4.3 Create New Permission
**POST** `{{baseUrl}}/api/permissions`

**Headers:**
```
Authorization: {{authToken}}
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "permissionName": "user:export",
  "description": "Export user data to CSV"
}
```

**Expected Response (201):**
```json
{
  "status": "success",
  "message": "Permiso creado exitosamente",
  "data": {
    "permission": {
      "permissionsId": 11,
      "permissionName": "user:export",
      "description": "Export user data to CSV"
    }
  }
}
```

### 4.4 Update Permission
**PUT** `{{baseUrl}}/api/permissions/11`

**Headers:**
```
Authorization: {{authToken}}
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "permissionName": "user:export_csv",
  "description": "Export user data to CSV format"
}
```

**Expected Response (200):**
```json
{
  "status": "success",
  "message": "Permiso actualizado exitosamente",
  "data": {
    "permission": {
      "permissionsId": 11,
      "permissionName": "user:export_csv",
      "description": "Export user data to CSV format"
    }
  }
}
```

### 4.5 Delete Permission
**DELETE** `{{baseUrl}}/api/permissions/11`

**Headers:**
```
Authorization: {{authToken}}
Content-Type: application/json
```

**Expected Response (200):**
```json
{
  "status": "success",
  "message": "Permiso eliminado exitosamente"
}
```

---

## 5. Beneficiary Management Endpoints

### 5.1 Create Beneficiary
**POST** `{{baseUrl}}/api/beneficiarios`

**Headers:**
```
Authorization: {{authToken}}
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "username": "beneficiary1",
  "credentials": "password123",
  "discountCategory": "GENERAL",
  "discount": 0.15
}
```

**Expected Response (201):**
```json
{
  "status": "success",
  "message": "Beneficiario creado exitosamente",
  "data": {
    "beneficiary": {
      "beneficiaryId": 1,
      "discountCategory": "GENERAL",
      "discount": 0.15,
      "user": {
        "userId": 3,
        "username": "beneficiary1"
      }
    }
  }
}
```

---

## 6. Error Response Examples

### 6.1 400 Bad Request
```json
{
  "status": "error",
  "message": "Error al crear usuario",
  "error": "Username already exists"
}
```

### 6.2 401 Unauthorized
```json
{
  "status": "error",
  "message": "Token de autenticación requerido"
}
```

### 6.3 403 Forbidden
```json
{
  "status": "error",
  "message": "No tiene permisos para acceder a este recurso"
}
```

### 6.4 404 Not Found
```json
{
  "status": "error",
  "message": "Usuario no encontrado"
}
```

### 6.5 500 Internal Server Error
```json
{
  "status": "error",
  "message": "Error interno del servidor",
  "error": "Database connection failed"
}
```

---

## 7. Testing Scenarios

### 7.1 Complete User Workflow
1. **Login** with admin credentials
2. **Create** a new user
3. **Get** the created user by ID
4. **Update** the user information
5. **Delete** the user

### 7.2 Role and Permission Workflow
1. **Create** a new permission
2. **Create** a new role
3. **Assign** permission to role (via database or additional endpoint)
4. **Create** user with the new role
5. **Verify** user has the assigned permissions

### 7.3 Beneficiary Workflow
1. **Create** a beneficiary with user account
2. **Verify** the beneficiary has discount information
3. **Test** beneficiary-specific functionality

### 7.4 Error Handling
1. **Test** invalid login credentials
2. **Test** accessing protected endpoints without token
3. **Test** accessing non-existent resources
4. **Test** invalid request data

---

## 8. Postman Collection Import

To import this collection into Postman:

1. Create a new collection in Postman
2. Set up environment variables:
   - `baseUrl`: `http://localhost:3002`
   - `authToken`: (will be set automatically after login)
3. Create requests for each endpoint above
4. Use the test scripts provided to automatically set the auth token
5. Run the collection to test all endpoints

---

## 9. Performance Testing

### 9.1 Load Testing Scenarios
- **Concurrent Users**: Test with 10, 50, 100 concurrent users
- **Database Load**: Test with large datasets (1000+ users)
- **Response Time**: Ensure responses under 200ms for most endpoints
- **Error Rate**: Maintain error rate below 1%

### 9.2 Stress Testing
- **Memory Usage**: Monitor memory consumption during high load
- **Database Connections**: Ensure connection pool handles load
- **CPU Usage**: Monitor CPU usage during peak loads

---

## 10. Security Testing

### 10.1 Authentication Tests
- **Invalid Credentials**: Test with wrong username/password
- **Expired Tokens**: Test with expired authentication tokens
- **Missing Tokens**: Test endpoints without authentication

### 10.2 Authorization Tests
- **Role-based Access**: Test different user roles
- **Permission-based Access**: Test specific permissions
- **Unauthorized Access**: Test accessing restricted resources

### 10.3 Input Validation
- **SQL Injection**: Test with malicious SQL input
- **XSS Attacks**: Test with script injection
- **Data Validation**: Test with invalid data formats

---

This collection provides comprehensive testing coverage for all microservice functionalities. Use it to ensure the API works correctly and handles various scenarios appropriately. 