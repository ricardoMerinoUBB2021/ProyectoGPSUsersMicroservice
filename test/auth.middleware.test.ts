import { Request, Response, NextFunction } from 'express';
import { AuthMiddleware } from '../src/middlewares/auth.middleware';
import { AuthService } from '../src/services/auth.service';

// Mock the AuthService
jest.mock('../src/services/auth.service');

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let authMiddleware: AuthMiddleware;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create mock request, response, and next function
    mockRequest = {
      headers: {},
      user: undefined
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    mockNext = jest.fn();

    // Create the middleware instance
    authMiddleware = new AuthMiddleware();
  });

  describe('verifyToken', () => {
    it('should call next() when valid authorization header is provided', () => {
      mockRequest.headers = {
        authorization: 'Bearer valid-token'
      };

      authMiddleware.verifyToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 401 when no authorization header is provided', () => {
      mockRequest.headers = {};

      authMiddleware.verifyToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Token de autenticación requerido'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when authorization header does not start with Bearer', () => {
      mockRequest.headers = {
        authorization: 'Invalid-Token'
      };

      authMiddleware.verifyToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Token de autenticación requerido'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when token is missing after Bearer', () => {
      mockRequest.headers = {
        authorization: 'Bearer '
      };

      authMiddleware.verifyToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Token de autenticación requerido'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('hasPermission', () => {
    it('should call next() when user has required permission', () => {
      const mockUser = {
        userId: 1,
        username: 'testuser',
        roles: [
          {
            roleId: 1,
            roleName: 'ADMIN',
            permissions: [
              { permissionsId: 1, permissionName: 'user:read' }
            ]
          }
        ],
        beneficiary: null
      };

      mockRequest.user = mockUser as any;

      // Mock the hasPermission method
      jest.spyOn(authMiddleware['authService'], 'hasPermission').mockReturnValue(true);

      const hasPermissionMiddleware = authMiddleware.hasPermission('user:read');
      hasPermissionMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 401 when user is not authenticated', () => {
      mockRequest.user = undefined;

      const hasPermissionMiddleware = authMiddleware.hasPermission('user:read');
      hasPermissionMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Usuario no autenticado'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 403 when user does not have required permission', () => {
      const mockUser = {
        userId: 1,
        username: 'testuser',
        roles: [],
        beneficiary: null
      };

      mockRequest.user = mockUser as any;

      // Mock the hasPermission method to return false
      jest.spyOn(authMiddleware['authService'], 'hasPermission').mockReturnValue(false);

      const hasPermissionMiddleware = authMiddleware.hasPermission('user:read');
      hasPermissionMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'No tiene permisos para acceder a este recurso'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('hasRole', () => {
    it('should call next() when user has required role', () => {
      const mockUser = {
        userId: 1,
        username: 'testuser',
        roles: [
          {
            roleId: 1,
            roleName: 'ADMIN',
            permissions: []
          }
        ],
        beneficiary: null
      };

      mockRequest.user = mockUser as any;

      const hasRoleMiddleware = authMiddleware.hasRole(['ADMIN']);
      hasRoleMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 401 when user is not authenticated', () => {
      mockRequest.user = undefined;

      const hasRoleMiddleware = authMiddleware.hasRole(['ADMIN']);
      hasRoleMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Usuario no autenticado'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 403 when user does not have required role', () => {
      const mockUser = {
        userId: 1,
        username: 'testuser',
        roles: [
          {
            roleId: 1,
            roleName: 'USER',
            permissions: []
          }
        ],
        beneficiary: null
      };

      mockRequest.user = mockUser as any;

      const hasRoleMiddleware = authMiddleware.hasRole(['ADMIN']);
      hasRoleMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'No tiene el rol necesario para acceder a este recurso'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next() when user has any of the required roles', () => {
      const mockUser = {
        userId: 1,
        username: 'testuser',
        roles: [
          {
            roleId: 1,
            roleName: 'MODERATOR',
            permissions: []
          }
        ],
        beneficiary: null
      };

      mockRequest.user = mockUser as any;

      const hasRoleMiddleware = authMiddleware.hasRole(['ADMIN', 'MODERATOR']);
      hasRoleMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });
}); 