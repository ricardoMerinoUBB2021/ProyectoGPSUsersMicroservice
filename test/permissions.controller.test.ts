import { PermissionsController } from '../src/controllers/permissions.controller';
import { PermissionsService } from '../src/services/permissions.service';
import { Request, Response } from 'express';

// Mock the PermissionsService
jest.mock('../src/services/permissions.service');

describe('PermissionsController', () => {
  let permissionsController: PermissionsController;
  let mockPermissionsService: jest.Mocked<PermissionsService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create mock service
    mockPermissionsService = new PermissionsService() as jest.Mocked<PermissionsService>;

    // Create mock response methods
    mockJson = jest.fn().mockReturnThis();
    mockStatus = jest.fn().mockReturnThis();

    // Create mock request and response
    mockRequest = {
      params: {},
      query: {},
      body: {}
    };

    mockResponse = {
      status: mockStatus,
      json: mockJson
    };

    // Create controller instance
    permissionsController = new PermissionsController();
    (permissionsController as any).permissionsService = mockPermissionsService;
  });

  describe('createPermission', () => {
    it('should create new permission', async () => {
      const permissionData = { 
        permissionName: 'user:export', 
        description: 'Export user data to CSV' 
      };
      const mockPermission = { permissionsId: 1, ...permissionData };

      mockRequest.body = permissionData;
      mockPermissionsService.createPermission.mockResolvedValue(mockPermission);

      await permissionsController.createPermission(mockRequest as Request, mockResponse as Response);

      expect(mockPermissionsService.createPermission).toHaveBeenCalledWith(permissionData);
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'success',
        message: 'Permiso creado exitosamente',
        data: { permission: mockPermission }
      });
    });

    it('should handle errors', async () => {
      const error = new Error('Validation error');
      mockRequest.body = { permissionName: 'user:export' };
      mockPermissionsService.createPermission.mockRejectedValue(error);

      await permissionsController.createPermission(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'error',
        message: 'Error al crear permiso',
        error: 'Validation error'
      });
    });
  });

  describe('getAllPermissions', () => {
    it('should return all permissions', async () => {
      const mockPermissions = [
        { permissionsId: 1, permissionName: 'user:read', description: 'Read user information' },
        { permissionsId: 2, permissionName: 'user:write', description: 'Create and update users' }
      ];

      mockPermissionsService.getPermissions.mockResolvedValue(mockPermissions);

      await permissionsController.getAllPermissions(mockRequest as Request, mockResponse as Response);

      expect(mockPermissionsService.getPermissions).toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'success',
        data: { permissions: mockPermissions }
      });
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      mockPermissionsService.getPermissions.mockRejectedValue(error);

      await permissionsController.getAllPermissions(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'error',
        message: 'Error al obtener permisos',
        error: 'Database error'
      });
    });
  });

  describe('getPermissionById', () => {
    it('should return permission by ID', async () => {
      const mockPermission = { 
        permissionsId: 1, 
        permissionName: 'user:read', 
        description: 'Read user information' 
      };

      mockRequest.params = { id: '1' };
      mockPermissionsService.getPermissionById.mockResolvedValue(mockPermission);

      await permissionsController.getPermissionById(mockRequest as Request, mockResponse as Response);

      expect(mockPermissionsService.getPermissionById).toHaveBeenCalledWith(1);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'success',
        data: { permission: mockPermission }
      });
    });

    it('should return 404 if permission not found', async () => {
      mockRequest.params = { id: '999' };
      mockPermissionsService.getPermissionById.mockResolvedValue(null);

      await permissionsController.getPermissionById(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'error',
        message: 'Permiso no encontrado'
      });
    });
  });

  describe('updatePermission', () => {
    it('should update existing permission', async () => {
      const updateData = { 
        permissionName: 'user:export_csv', 
        description: 'Export user data to CSV format' 
      };
      const mockPermission = { permissionsId: 1, ...updateData };

      mockRequest.params = { id: '1' };
      mockRequest.body = updateData;
      mockPermissionsService.updatePermission.mockResolvedValue(mockPermission);

      await permissionsController.updatePermission(mockRequest as Request, mockResponse as Response);

      expect(mockPermissionsService.updatePermission).toHaveBeenCalledWith(1, updateData);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'success',
        message: 'Permiso actualizado exitosamente',
        data: { permission: mockPermission }
      });
    });

    it('should return 404 if permission not found', async () => {
      mockRequest.params = { id: '999' };
      mockRequest.body = { permissionName: 'user:export' };
      mockPermissionsService.updatePermission.mockResolvedValue(null);

      await permissionsController.updatePermission(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'error',
        message: 'Permiso no encontrado'
      });
    });
  });

  describe('deletePermission', () => {
    it('should delete permission successfully', async () => {
      mockRequest.params = { id: '1' };
      mockPermissionsService.deletePermission.mockResolvedValue(true);

      await permissionsController.deletePermission(mockRequest as Request, mockResponse as Response);

      expect(mockPermissionsService.deletePermission).toHaveBeenCalledWith(1);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'success',
        message: 'Permiso eliminado exitosamente'
      });
    });

    it('should return 404 if permission not found', async () => {
      mockRequest.params = { id: '999' };
      mockPermissionsService.deletePermission.mockResolvedValue(false);

      await permissionsController.deletePermission(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'error',
        message: 'Permiso no encontrado'
      });
    });
  });
}); 