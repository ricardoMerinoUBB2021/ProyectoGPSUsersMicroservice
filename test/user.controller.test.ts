import { UserController } from '../src/controllers/user.controller';
import { UserService } from '../src/services/user.service';
import { Request, Response } from 'express';

// Mock the UserService
jest.mock('../src/services/user.service');

describe('UserController', () => {
  let userController: UserController;
  let mockUserService: jest.Mocked<UserService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create mock service
    mockUserService = new UserService() as jest.Mocked<UserService>;

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
    userController = new UserController();
    (userController as any).userService = mockUserService;
  });

  describe('getAllUsers', () => {
    it('should return users with pagination', async () => {
      const mockUsers = [
        { userId: 1, username: 'user1' },
        { userId: 2, username: 'user2' }
      ];
      const mockTotal = 2;

      mockRequest.query = { page: '1', limit: '10' };
      mockUserService.findAllUsers.mockResolvedValue({ users: mockUsers, total: mockTotal });

      await userController.getAllUsers(mockRequest as Request, mockResponse as Response);

      expect(mockUserService.findAllUsers).toHaveBeenCalledWith(1, 10);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'success',
        data: {
          users: mockUsers,
          pagination: {
            total: mockTotal,
            page: 1,
            limit: 10,
            pages: 1
          }
        }
      });
    });

    it('should use default pagination values', async () => {
      mockUserService.findAllUsers.mockResolvedValue({ users: [], total: 0 });

      await userController.getAllUsers(mockRequest as Request, mockResponse as Response);

      expect(mockUserService.findAllUsers).toHaveBeenCalledWith(1, 10);
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      mockUserService.findAllUsers.mockRejectedValue(error);

      await userController.getAllUsers(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'error',
        message: 'Error al obtener usuarios',
        error: 'Database error'
      });
    });
  });

  describe('getUserById', () => {
    it('should return user by ID', async () => {
      const mockUser = { userId: 1, username: 'testuser' };

      mockRequest.params = { id: '1' };
      mockUserService.findUserById.mockResolvedValue(mockUser);

      await userController.getUserById(mockRequest as Request, mockResponse as Response);

      expect(mockUserService.findUserById).toHaveBeenCalledWith(1);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'success',
        data: { user: mockUser }
      });
    });

    it('should return 404 if user not found', async () => {
      mockRequest.params = { id: '999' };
      mockUserService.findUserById.mockResolvedValue(null);

      await userController.getUserById(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'error',
        message: 'Usuario no encontrado'
      });
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      mockRequest.params = { id: '1' };
      mockUserService.findUserById.mockRejectedValue(error);

      await userController.getUserById(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'error',
        message: 'Error al obtener usuario',
        error: 'Database error'
      });
    });
  });

  describe('createUser', () => {
    it('should create new user', async () => {
      const userData = { username: 'newuser', credentials: 'password123' };
      const mockUser = { userId: 1, ...userData };

      mockRequest.body = userData;
      mockUserService.createUser.mockResolvedValue(mockUser);

      await userController.createUser(mockRequest as Request, mockResponse as Response);

      expect(mockUserService.createUser).toHaveBeenCalledWith(userData);
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'success',
        message: 'Usuario creado exitosamente',
        data: { user: mockUser }
      });
    });

    it('should handle errors', async () => {
      const error = new Error('Validation error');
      mockRequest.body = { username: 'newuser' };
      mockUserService.createUser.mockRejectedValue(error);

      await userController.createUser(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'error',
        message: 'Error al crear usuario',
        error: 'Validation error'
      });
    });
  });

  describe('updateUser', () => {
    it('should update existing user', async () => {
      const updateData = { username: 'updateduser' };
      const mockUser = { userId: 1, ...updateData };

      mockRequest.params = { id: '1' };
      mockRequest.body = updateData;
      mockUserService.updateUser.mockResolvedValue(mockUser);

      await userController.updateUser(mockRequest as Request, mockResponse as Response);

      expect(mockUserService.updateUser).toHaveBeenCalledWith(1, updateData);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'success',
        message: 'Usuario actualizado exitosamente',
        data: { user: mockUser }
      });
    });

    it('should return 404 if user not found', async () => {
      mockRequest.params = { id: '999' };
      mockRequest.body = { username: 'updateduser' };
      mockUserService.updateUser.mockResolvedValue(null);

      await userController.updateUser(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'error',
        message: 'Usuario no encontrado'
      });
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      mockRequest.params = { id: '1' };
      mockUserService.deleteUser.mockResolvedValue(true);

      await userController.deleteUser(mockRequest as Request, mockResponse as Response);

      expect(mockUserService.deleteUser).toHaveBeenCalledWith(1);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'success',
        message: 'Usuario eliminado exitosamente'
      });
    });

    it('should return 404 if user not found', async () => {
      mockRequest.params = { id: '999' };
      mockUserService.deleteUser.mockResolvedValue(false);

      await userController.deleteUser(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'error',
        message: 'Usuario no encontrado'
      });
    });
  });

  describe('createBeneficiary', () => {
    it('should create beneficiary with user', async () => {
      const userData = { username: 'beneficiary', credentials: 'password123' };
      const beneficiaryData = { discountCategory: 'GENERAL', discount: 0.1 };
      const mockBeneficiary = { beneficiaryId: 1, ...beneficiaryData };

      mockRequest.body = { ...userData, ...beneficiaryData };
      mockUserService.createBeneficiary.mockResolvedValue(mockBeneficiary);

      await userController.createBeneficiary(mockRequest as Request, mockResponse as Response);

      expect(mockUserService.createBeneficiary).toHaveBeenCalledWith(userData, beneficiaryData);
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'success',
        message: 'Beneficiario creado exitosamente',
        data: { beneficiary: mockBeneficiary }
      });
    });
  });

  describe('getAllRoles', () => {
    it('should return all roles', async () => {
      const mockRoles = [
        { roleId: 1, roleName: 'ADMIN' },
        { roleId: 2, roleName: 'USER' }
      ];

      mockUserService.getAllRoles.mockResolvedValue(mockRoles);

      await userController.getAllRoles(mockRequest as Request, mockResponse as Response);

      expect(mockUserService.getAllRoles).toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'success',
        data: { roles: mockRoles }
      });
    });
  });

  describe('createRole', () => {
    it('should create new role', async () => {
      const roleData = { roleName: 'NEW_ROLE', description: 'New role description' };
      const mockRole = { roleId: 1, ...roleData };

      mockRequest.body = roleData;
      mockUserService.createRole.mockResolvedValue(mockRole);

      await userController.createRole(mockRequest as Request, mockResponse as Response);

      expect(mockUserService.createRole).toHaveBeenCalledWith(roleData);
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'success',
        message: 'Rol creado exitosamente',
        data: { role: mockRole }
      });
    });
  });

  describe('updateRole', () => {
    it('should update existing role', async () => {
      const updateData = { roleName: 'UPDATED_ROLE' };
      const mockRole = { roleId: 1, ...updateData };

      mockRequest.params = { id: '1' };
      mockRequest.body = updateData;
      mockUserService.updateRole.mockResolvedValue(mockRole);

      await userController.updateRole(mockRequest as Request, mockResponse as Response);

      expect(mockUserService.updateRole).toHaveBeenCalledWith(1, updateData);
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
      mockUserService.updateRole.mockResolvedValue(null);

      await userController.updateRole(mockRequest as Request, mockResponse as Response);

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
      mockUserService.deleteRole.mockResolvedValue(true);

      await userController.deleteRole(mockRequest as Request, mockResponse as Response);

      expect(mockUserService.deleteRole).toHaveBeenCalledWith(1);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'success',
        message: 'Rol eliminado exitosamente'
      });
    });

    it('should return 404 if role not found', async () => {
      mockRequest.params = { id: '999' };
      mockUserService.deleteRole.mockResolvedValue(false);

      await userController.deleteRole(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'error',
        message: 'Rol no encontrado'
      });
    });
  });

  describe('getAllPermissions', () => {
    it('should return all permissions', async () => {
      const mockPermissions = [
        { permissionsId: 1, permissionName: 'user:read' },
        { permissionsId: 2, permissionName: 'user:write' }
      ];

      mockUserService.getAllPermissions.mockResolvedValue(mockPermissions);

      await userController.getAllPermissions(mockRequest as Request, mockResponse as Response);

      expect(mockUserService.getAllPermissions).toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'success',
        data: { permissions: mockPermissions }
      });
    });
  });
}); 