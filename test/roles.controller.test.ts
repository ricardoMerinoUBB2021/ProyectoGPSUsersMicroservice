import { RolesController } from '../src/controllers/roles.controller';
import { RolesService } from '../src/services/roles.service';
import { Request, Response } from 'express';

// Mock the RolesService
jest.mock('../src/services/roles.service');

describe('RolesController', () => {
  let rolesController: RolesController;
  let mockRolesService: jest.Mocked<RolesService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create mock service
    mockRolesService = new RolesService() as jest.Mocked<RolesService>;

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
    rolesController = new RolesController();
    (rolesController as any).rolesService = mockRolesService;
  });

  describe('createRole', () => {
    it('should create new role', async () => {
      const roleData = { roleName: 'NEW_ROLE', description: 'New role description' };
      const mockRole = { 
        roleId: 1, 
        roleName: 'NEW_ROLE', 
        description: 'New role description',
        permissions: []
      };

      mockRequest.body = roleData;
      mockRolesService.createRole.mockResolvedValue(mockRole as any);

      await rolesController.createRole(mockRequest as Request, mockResponse as Response);

      expect(mockRolesService.createRole).toHaveBeenCalledWith(roleData);
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'success',
        message: 'Rol creado exitosamente',
        data: { role: mockRole }
      });
    });

    it('should handle errors', async () => {
      const error = new Error('Validation error');
      mockRequest.body = { roleName: 'NEW_ROLE' };
      mockRolesService.createRole.mockRejectedValue(error);

      await rolesController.createRole(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'error',
        message: 'Error al crear rol',
        error: 'Validation error'
      });
    });
  });

  describe('getRoles', () => {
    it('should return all roles', async () => {
      const mockRoles = [
        { 
          roleId: 1, 
          roleName: 'ADMIN',
          description: 'Administrator role',
          permissions: []
        },
        { 
          roleId: 2, 
          roleName: 'USER',
          description: 'User role',
          permissions: []
        }
      ];

      mockRolesService.getRoles.mockResolvedValue(mockRoles as any);

      await rolesController.getRoles(mockRequest as Request, mockResponse as Response);

      expect(mockRolesService.getRoles).toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'success',
        data: { roles: mockRoles }
      });
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      mockRolesService.getRoles.mockRejectedValue(error);

      await rolesController.getRoles(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'error',
        message: 'Error al obtener roles',
        error: 'Database error'
      });
    });
  });

  describe('getRoleById', () => {
    it('should return role by ID', async () => {
      const mockRole = { 
        roleId: 1, 
        roleName: 'ADMIN',
        description: 'Administrator role',
        permissions: []
      };

      mockRequest.params = { id: '1' };
      mockRolesService.getRoleById.mockResolvedValue(mockRole as any);

      await rolesController.getRoleById(mockRequest as Request, mockResponse as Response);

      expect(mockRolesService.getRoleById).toHaveBeenCalledWith(1);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'success',
        data: { role: mockRole }
      });
    });

    it('should return 404 if role not found', async () => {
      mockRequest.params = { id: '999' };
      mockRolesService.getRoleById.mockResolvedValue(null);

      await rolesController.getRoleById(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'error',
        message: 'Rol no encontrado'
      });
    });
  });

  describe('updateRole', () => {
    it('should update existing role', async () => {
      const updateData = { roleName: 'UPDATED_ROLE' };
      const mockRole = { 
        roleId: 1, 
        roleName: 'UPDATED_ROLE',
        description: 'Updated role description',
        permissions: []
      };

      mockRequest.params = { id: '1' };
      mockRequest.body = updateData;
      mockRolesService.updateRole.mockResolvedValue(mockRole as any);

      await rolesController.updateRole(mockRequest as Request, mockResponse as Response);

      expect(mockRolesService.updateRole).toHaveBeenCalledWith(1, updateData);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'success',
        message: 'Rol actualizado exitosamente',
        data: { role: mockRole }
      });
    });

    it('should return 404 if role not found', async () => {
      mockRequest.params = { id: '999' };
      mockRequest.body = { roleName: 'UPDATED_ROLE' };
      mockRolesService.updateRole.mockResolvedValue(null);

      await rolesController.updateRole(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'error',
        message: 'Rol no encontrado'
      });
    });
  });

  describe('deleteRole', () => {
    it('should delete role successfully', async () => {
      mockRequest.params = { id: '1' };
      mockRolesService.deleteRole.mockResolvedValue(true);

      await rolesController.deleteRole(mockRequest as Request, mockResponse as Response);

      expect(mockRolesService.deleteRole).toHaveBeenCalledWith(1);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'success',
        message: 'Rol eliminado exitosamente'
      });
    });

    it('should return 404 if role not found', async () => {
      mockRequest.params = { id: '999' };
      mockRolesService.deleteRole.mockResolvedValue(false);

      await rolesController.deleteRole(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'error',
        message: 'Rol no encontrado'
      });
    });
  });
}); 