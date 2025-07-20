import { AuthService } from '../src/services/auth.service';
import { User } from '../src/entities/user.entity';
import { Role } from '../src/entities/role.entity';
import { Permission } from '../src/entities/permission.entity';
import AppDataSource from '../src/config/data-source';
import * as bcrypt from 'bcrypt';

// Mock the data source and bcrypt
jest.mock('../src/config/data-source');
jest.mock('bcrypt');

describe('AuthService', () => {
  let authService: AuthService;
  let mockUserRepository: any;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create mock repository
    mockUserRepository = {
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      save: jest.fn()
    };

    // Mock the getRepository method
    (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockUserRepository);

    authService = new AuthService();
  });

  describe('login', () => {
    it('should login user with valid credentials', async () => {
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
          }
        ],
        beneficiary: null
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.login('testuser', 'password123');

      expect(result).toEqual({
        user: {
          userId: 1,
          username: 'testuser',
          roles: mockUser.roles,
          beneficiary: null
        }
      });

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { username: 'testuser' },
        relations: ['roles', 'beneficiary']
      });
      expect(bcrypt.compare).toHaveBeenCalledWith('password123salt123', 'hashedPassword');
    });

    it('should return null for invalid username', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await authService.login('nonexistent', 'password123');

      expect(result).toBeNull();
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { username: 'nonexistent' },
        relations: ['roles', 'beneficiary']
      });
    });

    it('should return null for invalid password', async () => {
      const mockUser = {
        userId: 1,
        username: 'testuser',
        credentials: 'hashedPassword',
        salt: 'salt123'
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await authService.login('testuser', 'wrongpassword');

      expect(result).toBeNull();
      expect(bcrypt.compare).toHaveBeenCalledWith('wrongpasswordsalt123', 'hashedPassword');
    });
  });

  describe('getUserProfile', () => {
    it('should return user profile without sensitive data', async () => {
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
          }
        ],
        beneficiary: {
          beneficiaryId: 1,
          discountCategory: 'GENERAL',
          discount: 0.1
        }
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await authService.getUserProfile(1);

      expect(result).toEqual({
        userId: 1,
        username: 'testuser',
        roles: mockUser.roles,
        beneficiary: mockUser.beneficiary
      });

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { userId: 1 },
        relations: ['roles', 'beneficiary']
      });
    });

    it('should return null if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await authService.getUserProfile(999);

      expect(result).toBeNull();
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const mockUser = {
        userId: 1,
        username: 'testuser',
        credentials: 'oldHashedPassword',
        salt: 'oldSalt123'
      };

      const newSalt = 'newSalt123';
      const newHashedPassword = 'newHashedPassword';

      mockUserRepository.findOneBy.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.genSalt as jest.Mock).mockResolvedValue(newSalt);
      (bcrypt.hash as jest.Mock).mockResolvedValue(newHashedPassword);
      mockUserRepository.save.mockResolvedValue({
        ...mockUser,
        credentials: newHashedPassword,
        salt: newSalt
      });

      const result = await authService.changePassword(1, 'oldpassword', 'newpassword');

      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith('oldpasswordoldSalt123', 'oldHashedPassword');
      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith('newpasswordnewSalt123', 10);
      expect(mockUserRepository.save).toHaveBeenCalledWith({
        ...mockUser,
        credentials: newHashedPassword,
        salt: newSalt
      });
    });

    it('should return false if user not found', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(null);

      const result = await authService.changePassword(999, 'oldpassword', 'newpassword');

      expect(result).toBe(false);
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ userId: 999 });
    });

    it('should return false for invalid current password', async () => {
      const mockUser = {
        userId: 1,
        username: 'testuser',
        credentials: 'oldHashedPassword',
        salt: 'oldSalt123'
      };

      mockUserRepository.findOneBy.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await authService.changePassword(1, 'wrongpassword', 'newpassword');

      expect(result).toBe(false);
      expect(bcrypt.compare).toHaveBeenCalledWith('wrongpasswordoldSalt123', 'oldHashedPassword');
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('hasPermission', () => {
    it('should return true if user has required permission', () => {
      const mockUser: User = {
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
      } as User;

      const result = authService.hasPermission(mockUser, 'user:read');

      expect(result).toBe(true);
    });

    it('should return true if user has permission in multiple roles', () => {
      const mockUser: User = {
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
      } as User;

      const result = authService.hasPermission(mockUser, 'user:write');

      expect(result).toBe(true);
    });

    it('should return false if user does not have required permission', () => {
      const mockUser: User = {
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
      } as User;

      const result = authService.hasPermission(mockUser, 'user:delete');

      expect(result).toBe(false);
    });

    it('should return false if user has no roles', () => {
      const mockUser: User = {
        userId: 1,
        username: 'testuser',
        credentials: 'hashedPassword',
        salt: 'salt123',
        roles: [],
        beneficiary: null
      } as User;

      const result = authService.hasPermission(mockUser, 'user:read');

      expect(result).toBe(false);
    });

    it('should return false if user roles have no permissions', () => {
      const mockUser: User = {
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
      } as User;

      const result = authService.hasPermission(mockUser, 'user:read');

      expect(result).toBe(false);
    });

    it('should return false if user is null', () => {
      const result = authService.hasPermission(null as any, 'user:read');

      expect(result).toBe(false);
    });
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const userData = {
        username: 'newuser',
        credentials: 'password123'
      };

      const mockUser = {
        userId: 1,
        ...userData
      };

      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);

      const result = await authService.register(userData);

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.create).toHaveBeenCalledWith(userData);
      expect(mockUserRepository.save).toHaveBeenCalled();
    });
  });
}); 