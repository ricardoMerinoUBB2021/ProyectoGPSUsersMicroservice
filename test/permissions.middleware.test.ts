import { Request, Response, NextFunction } from 'express';
import { checkPermissions } from '../src/middlewares/permissions.middleware';

describe('Permissions Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create mock request, response, and next function
    mockRequest = {
      user: undefined
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    mockNext = jest.fn();
  });

  describe('checkPermissions', () => {
    it('should call next() when user has required permissions', () => {
      const mockUser = {
        userId: 1,
        username: 'testuser',
        credentials: 'hashedPassword',
        salt: 'salt123',
        roles: [
          {
            roleId: 1,
            roleName: 'ADMIN',
            permissions: [
              { permissionsId: 1, permissionName: 'user:read' },
              { permissionsId: 2, permissionName: 'user:write' }
            ]
          }
        ],
        beneficiary: null
      };

      mockRequest.user = mockUser as any;

      const middleware = checkPermissions(['user:read']);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 401 when user is not authenticated', () => {
      mockRequest.user = undefined;

      const middleware = checkPermissions(['user:read']);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Usuario no autenticado'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 403 when user does not have required permissions', () => {
      const mockUser = {
        userId: 1,
        username: 'testuser',
        credentials: 'hashedPassword',
        salt: 'salt123',
        roles: [
          {
            roleId: 1,
            roleName: 'USER',
            permissions: [
              { permissionsId: 1, permissionName: 'user:read' }
            ]
          }
        ],
        beneficiary: null
      };

      mockRequest.user = mockUser as any;

      const middleware = checkPermissions(['user:delete']);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'No tiene permisos para acceder a este recurso'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 403 when user has no roles', () => {
      const mockUser = {
        userId: 1,
        username: 'testuser',
        credentials: 'hashedPassword',
        salt: 'salt123',
        roles: [],
        beneficiary: null
      };

      mockRequest.user = mockUser as any;

      const middleware = checkPermissions(['user:read']);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'No tiene permisos para acceder a este recurso'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 403 when user roles have no permissions', () => {
      const mockUser = {
        userId: 1,
        username: 'testuser',
        credentials: 'hashedPassword',
        salt: 'salt123',
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

      const middleware = checkPermissions(['user:read']);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'No tiene permisos para acceder a este recurso'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next() when user has permissions from multiple roles', () => {
      const mockUser = {
        userId: 1,
        username: 'testuser',
        credentials: 'hashedPassword',
        salt: 'salt123',
        roles: [
          {
            roleId: 1,
            roleName: 'ADMIN',
            permissions: [
              { permissionsId: 1, permissionName: 'user:read' }
            ]
          },
          {
            roleId: 2,
            roleName: 'MODERATOR',
            permissions: [
              { permissionsId: 2, permissionName: 'user:write' }
            ]
          }
        ],
        beneficiary: null
      };

      mockRequest.user = mockUser as any;

      const middleware = checkPermissions(['user:read', 'user:write']);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });
}); 