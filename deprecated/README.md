# Authorization Components for API Gateway

This folder contains all the authorization-related components that were previously part of the Users Microservice. These components have been moved here to provide a reference for the API Gateway developers who will now handle all authorization logic.

## Overview

The Users Microservice no longer handles any authorization. Instead, the API Gateway should:
1. Verify JWT tokens
2. Check user permissions and roles
3. Pass user information to the Users Microservice via headers
4. Handle all authentication/authorization responses

## Components Overview

### Middlewares (`/middlewares/`)

#### `auth.middleware.ts`
Contains the core authorization middleware classes:
- `AuthMiddleware.verifyToken()` - JWT token verification
- `AuthMiddleware.hasPermission()` - Permission-based access control
- `AuthMiddleware.hasRole()` - Role-based access control

**Key Features:**
- JWT token extraction from Authorization header
- User authentication verification
- Permission checking through user roles
- Role-based access control

#### `permissions.middleware.ts`
Contains the `checkPermissions` middleware for granular permission checking.

### Controllers (`/controllers/`)

#### `auth.controller.ts`
Contains authentication endpoints:
- `register` - User registration
- `login` - User authentication
- `getProfile` - Get user profile
- `changePassword` - Change user password

**Note:** These endpoints should be moved to the API Gateway or a dedicated Auth Service.

### Services (`/services/`)

#### `auth.service.ts`
Contains the business logic for:
- User registration with password hashing
- User authentication
- Password change functionality
- Permission checking logic

### Routes (`/routes/`)

#### `auth.routes.ts`
Defines the authentication route structure that should be implemented in the API Gateway.

### Tests (`/test/`)

Contains test files for all authorization components that can be used as reference for testing the API Gateway implementation.

## API Gateway Integration Guide

### 1. JWT Token Verification

The API Gateway should implement JWT token verification similar to the `verifyToken` middleware:

```typescript
// Example JWT verification in API Gateway
const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Token de autenticación requerido'
      });
    }

    // Verify JWT token here
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'error',
      message: 'Token inválido'
    });
  }
};
```

### 2. Permission Checking

Implement permission checking similar to the `hasPermission` middleware:

```typescript
const hasPermission = (requiredPermission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Usuario no autenticado'
      });
    }

    // Check if user has required permission
    const hasPermission = checkUserPermission(req.user, requiredPermission);
    
    if (!hasPermission) {
      return res.status(403).json({
        status: 'error',
        message: 'No tiene permisos para acceder a este recurso'
      });
    }
    
    next();
  };
};
```

### 3. User Information Forwarding

When calling the Users Microservice, the API Gateway should pass user information via headers:

```typescript
// Example of forwarding user info to Users Microservice
const callUsersMicroservice = async (req: Request, endpoint: string) => {
  const headers = {
    'Content-Type': 'application/json',
    'X-User-ID': req.user?.userId,
    'X-User-Roles': req.user?.roles?.join(','),
    'X-User-Permissions': req.user?.permissions?.join(',')
  };

  const response = await fetch(`${USERS_MICROSERVICE_URL}${endpoint}`, {
    method: req.method,
    headers,
    body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined
  });

  return response;
};
```

### 4. Authentication Endpoints

The API Gateway should handle these authentication endpoints:

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration  
- `GET /api/auth/perfil` - Get user profile
- `POST /api/auth/cambiar-clave` - Change password

### 5. Protected Routes

All routes that previously required authentication should now be protected at the API Gateway level:

```typescript
// Example route protection
app.get('/api/usuarios', 
  verifyToken,
  hasPermission('user:read'),
  (req, res) => {
    // Forward to Users Microservice
    callUsersMicroservice(req, '/api/usuarios');
  }
);
```

## Database Schema Reference

The authorization system uses these database tables:

### Users Table
- `userid` (Primary Key)
- `username` (Unique)
- `credentials` (Password hash)
- `salt` (Salt for encryption)

### Roles Table
- `roleid` (Primary Key)
- `rolename` (Unique)
- `description`

### Permissions Table
- `permissionsid` (Primary Key)
- `permissionname`
- `description`

### Junction Tables
- `users_roles` - Many-to-many relationship between users and roles
- `roles_permissions` - Many-to-many relationship between roles and permissions

## Permission System

### Default Roles
1. **ADMIN** - Full access to all resources
2. **FARMACEUTICO** - Access to beneficiary and user read operations
3. **CAJERO** - Access to beneficiary read operations
4. **BENEFICIARIO** - Basic access

### Permission Naming Convention
Permissions follow the pattern: `resource:action`
- `user:read` - Read user information
- `user:write` - Create/update users
- `user:delete` - Delete users
- `beneficiary:read` - Read beneficiary information
- `beneficiary:write` - Create/update beneficiaries

## Security Considerations

1. **JWT Secret**: Use a strong, unique secret for JWT signing
2. **Token Expiration**: Implement appropriate token expiration times
3. **Password Hashing**: Use bcrypt with salt for password storage
4. **Rate Limiting**: Implement rate limiting for authentication endpoints
5. **CORS**: Configure CORS properly for cross-origin requests
6. **Input Validation**: Validate all inputs at the API Gateway level

## Testing

Use the test files in the `/test/` directory as reference for implementing comprehensive tests for the API Gateway authorization logic.

## Migration Checklist

- [ ] Implement JWT token verification
- [ ] Implement permission checking middleware
- [ ] Implement role-based access control
- [ ] Set up user information forwarding to Users Microservice
- [ ] Move authentication endpoints to API Gateway
- [ ] Update all protected routes to use API Gateway authorization
- [ ] Implement comprehensive error handling
- [ ] Add logging for authorization events
- [ ] Set up monitoring for authorization failures
- [ ] Implement rate limiting for authentication endpoints

## Contact

For questions about the authorization system or integration, refer to the original Users Microservice documentation or contact the development team. 