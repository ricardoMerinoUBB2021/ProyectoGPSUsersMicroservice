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
    it('should return users without pagination', async () => {
      const mockUsers = [
        { 
          userId: 1, 
          username: 'user1',
          credentials: 'hashedPassword',
          salt: 'salt123',
          roles: [],
          beneficiary: null
        },
        { 
          userId: 2, 
          username: 'user2',
          credentials: 'hashedPassword',
          salt: 'salt123',
          roles: [],
          beneficiary: null
        }
      ];

      mockUserService.findAllUsers.mockResolvedValue(mockUsers as any);

      await userController.getAllUsers(mockRequest as Request, mockResponse as Response);

      expect(mockUserService.findAllUsers).toHaveBeenCalledWith();
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'success',
        data: { users: mockUsers }
      });
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
      const mockUser = { 
        userId: 1, 
        username: 'testuser',
        credentials: 'hashedPassword',
        salt: 'salt123',
        roles: [],
        beneficiary: null
      };

      mockRequest.params = { id: '1' };
      mockUserService.findUserById.mockResolvedValue(mockUser as any);

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
      const mockUser = { 
        userId: 1, 
        username: 'newuser',
        credentials: 'hashedPassword',
        salt: 'salt123',
        roles: [],
        beneficiary: null
      };

      mockRequest.body = userData;
      mockUserService.createUser.mockResolvedValue(mockUser as any);

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
      const mockUser = { 
        userId: 1, 
        username: 'updateduser',
        credentials: 'hashedPassword',
        salt: 'salt123',
        roles: [],
        beneficiary: null
      };

      mockRequest.params = { id: '1' };
      mockRequest.body = updateData;
      mockUserService.updateUser.mockResolvedValue(mockUser as any);

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
      const mockBeneficiary = { 
        beneficiaryId: 1, 
        discountCategory: 'GENERAL', 
        discount: 0.1,
        user: {
          userId: 1,
          username: 'beneficiary',
          credentials: 'hashedPassword',
          salt: 'salt123',
          roles: [],
          beneficiary: null
        }
      };

      mockRequest.body = { ...userData, ...beneficiaryData };
      mockUserService.createBeneficiary.mockResolvedValue(mockBeneficiary as any);

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

  describe('getAllBeneficiaries', () => {
    it('should return all beneficiaries', async () => {
      const mockBeneficiaries = [
        { 
          beneficiaryId: 1, 
          discountCategory: 'GENERAL', 
          discount: 0.1,
          user: { userId: 1, username: 'beneficiary1' }
        },
        { 
          beneficiaryId: 2, 
          discountCategory: 'SENIOR', 
          discount: 0.15,
          user: { userId: 2, username: 'beneficiary2' }
        }
      ];

      mockUserService.getAllBeneficiaries.mockResolvedValue(mockBeneficiaries as any);

      await userController.getAllBeneficiaries(mockRequest as Request, mockResponse as Response);

      expect(mockUserService.getAllBeneficiaries).toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'success',
        data: { beneficiaries: mockBeneficiaries }
      });
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      mockUserService.getAllBeneficiaries.mockRejectedValue(error);

      await userController.getAllBeneficiaries(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'error',
        message: 'Error al obtener beneficiarios',
        error: 'Database error'
      });
    });
  });

  describe('getBeneficiaryById', () => {
    it('should return beneficiary by ID', async () => {
      const mockBeneficiary = { 
        beneficiaryId: 1, 
        discountCategory: 'GENERAL', 
        discount: 0.1,
        user: { userId: 1, username: 'beneficiary1' }
      };

      mockRequest.params = { id: '1' };
      mockUserService.findBeneficiaryById.mockResolvedValue(mockBeneficiary as any);

      await userController.getBeneficiaryById(mockRequest as Request, mockResponse as Response);

      expect(mockUserService.findBeneficiaryById).toHaveBeenCalledWith(1);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'success',
        data: { beneficiary: mockBeneficiary }
      });
    });

    it('should return 404 if beneficiary not found', async () => {
      mockRequest.params = { id: '999' };
      mockUserService.findBeneficiaryById.mockResolvedValue(null);

      await userController.getBeneficiaryById(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'error',
        message: 'Beneficiario no encontrado'
      });
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      mockRequest.params = { id: '1' };
      mockUserService.findBeneficiaryById.mockRejectedValue(error);

      await userController.getBeneficiaryById(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'error',
        message: 'Error al obtener beneficiario',
        error: 'Database error'
      });
    });
  });

  describe('updateBeneficiary', () => {
    it('should update existing beneficiary', async () => {
      const updateData = { discountCategory: 'SENIOR', discount: 0.15 };
      const mockBeneficiary = { 
        beneficiaryId: 1, 
        discountCategory: 'SENIOR', 
        discount: 0.15,
        user: { userId: 1, username: 'beneficiary1' }
      };

      mockRequest.params = { id: '1' };
      mockRequest.body = updateData;
      mockUserService.updateBeneficiary.mockResolvedValue(mockBeneficiary as any);

      await userController.updateBeneficiary(mockRequest as Request, mockResponse as Response);

      expect(mockUserService.updateBeneficiary).toHaveBeenCalledWith(1, updateData);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'success',
        message: 'Beneficiario actualizado exitosamente',
        data: { beneficiary: mockBeneficiary }
      });
    });

    it('should return 404 if beneficiary not found', async () => {
      mockRequest.params = { id: '999' };
      mockRequest.body = { discountCategory: 'SENIOR' };
      mockUserService.updateBeneficiary.mockResolvedValue(null);

      await userController.updateBeneficiary(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'error',
        message: 'Beneficiario no encontrado'
      });
    });

    it('should handle errors', async () => {
      const error = new Error('Validation error');
      mockRequest.params = { id: '1' };
      mockRequest.body = { discountCategory: 'SENIOR' };
      mockUserService.updateBeneficiary.mockRejectedValue(error);

      await userController.updateBeneficiary(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'error',
        message: 'Error al actualizar beneficiario',
        error: 'Validation error'
      });
    });
  });

  describe('deleteBeneficiary', () => {
    it('should delete beneficiary successfully', async () => {
      mockRequest.params = { id: '1' };
      mockUserService.deleteBeneficiary.mockResolvedValue(true);

      await userController.deleteBeneficiary(mockRequest as Request, mockResponse as Response);

      expect(mockUserService.deleteBeneficiary).toHaveBeenCalledWith(1);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'success',
        message: 'Beneficiario eliminado exitosamente'
      });
    });

    it('should return 404 if beneficiary not found', async () => {
      mockRequest.params = { id: '999' };
      mockUserService.deleteBeneficiary.mockResolvedValue(false);

      await userController.deleteBeneficiary(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'error',
        message: 'Beneficiario no encontrado'
      });
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      mockRequest.params = { id: '1' };
      mockUserService.deleteBeneficiary.mockRejectedValue(error);

      await userController.deleteBeneficiary(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'error',
        message: 'Error al eliminar beneficiario',
        error: 'Database error'
      });
    });
  });
}); 