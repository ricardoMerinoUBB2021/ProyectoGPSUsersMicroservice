import { UserService } from '../src/services/user.service';
import { User } from '../src/entities/user.entity';
import { Beneficiary } from '../src/entities/beneficiary.entity';
import { Role } from '../src/entities/role.entity';
import { Permission } from '../src/entities/permission.entity';
import { Person } from '../src/entities/person.entity';
import AppDataSource from '../src/config/data-source';

// Mock the data source
jest.mock('../src/config/data-source');

describe('UserService', () => {
  let userService: UserService;
  let mockUserRepository: any;
  let mockBeneficiaryRepository: any;
  let mockRoleRepository: any;
  let mockPermissionRepository: any;
  let mockPersonRepository: any;
  let mockQueryRunner: any;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create mock repositories
    mockUserRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      update: jest.fn()
    };

    mockBeneficiaryRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn()
    };

    mockRoleRepository = {
      find: jest.fn(),
      findOneBy: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn()
    };

    mockPermissionRepository = {
      find: jest.fn()
    };

    mockPersonRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn()
    };

    // Mock query runner
    mockQueryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        findOne: jest.fn(),
        getRepository: jest.fn(),
        save: jest.fn(),
        delete: jest.fn()
      }
    };

    // Mock the getRepository method
    (AppDataSource.getRepository as jest.Mock).mockImplementation((entity) => {
      if (entity === User) return mockUserRepository;
      if (entity === Beneficiary) return mockBeneficiaryRepository;
      if (entity === Role) return mockRoleRepository;
      if (entity === Permission) return mockPermissionRepository;
      if (entity === Person) return mockPersonRepository;
      return {};
    });

    // Mock createQueryRunner
    (AppDataSource.createQueryRunner as jest.Mock).mockReturnValue(mockQueryRunner);

    userService = new UserService();
  });

  describe('findAllUsers', () => {
    it('should return users without pagination', async () => {
      const mockUsers = [
        { userId: 1, username: 'user1' },
        { userId: 2, username: 'user2' }
      ];

      mockUserRepository.find.mockResolvedValue(mockUsers);

      const result = await userService.findAllUsers();

      expect(result).toEqual(mockUsers);
      expect(mockUserRepository.find).toHaveBeenCalledWith({
        relations: ['roles', 'beneficiary']
      });
    });
  });

  describe('findUserById', () => {
    it('should return user by ID', async () => {
      const mockUser = { userId: 1, username: 'testuser' };
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await userService.findUserById(1);

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { userId: 1 },
        relations: ['roles', 'beneficiary']
      });
    });

    it('should return null if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await userService.findUserById(999);

      expect(result).toBeNull();
    });
  });

  describe('findUserByUsername', () => {
    it('should return user by username', async () => {
      const mockUser = { userId: 1, username: 'testuser' };
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await userService.findUserByUsername('testuser');

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { username: 'testuser' },
        relations: ['roles', 'beneficiary']
      });
    });
  });

  describe('createUser', () => {
    it('should create user with hashed password', async () => {
      const userData = {
        username: 'newuser',
        credentials: 'password123'
      };

      const mockCreatedUser = { ...userData, userId: 1 };
      mockUserRepository.create.mockReturnValue(mockCreatedUser);
      mockUserRepository.save.mockResolvedValue(mockCreatedUser);

      const result = await userService.createUser(userData);

      expect(result).toEqual(mockCreatedUser);
      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should create user without password hashing if no credentials', async () => {
      const userData = {
        username: 'newuser'
      };

      const mockCreatedUser = { ...userData, userId: 1 };
      mockUserRepository.create.mockReturnValue(mockCreatedUser);
      mockUserRepository.save.mockResolvedValue(mockCreatedUser);

      const result = await userService.createUser(userData);

      expect(result).toEqual(mockCreatedUser);
    });

    it('should throw error if username already exists', async () => {
      const userData = {
        username: 'existinguser',
        credentials: 'password123'
      };

      mockUserRepository.findOne.mockResolvedValue({ userId: 1, username: 'existinguser' });

      await expect(userService.createUser(userData)).rejects.toThrow('Username already exists');
    });
  });

  describe('updateUser', () => {
    it('should update existing user', async () => {
      const existingUser = { userId: 1, username: 'olduser' };
      const updateData = { username: 'newuser' };
      const updatedUser = { ...existingUser, ...updateData };

      mockUserRepository.findOneBy.mockResolvedValue(existingUser);
      mockUserRepository.save.mockResolvedValue(updatedUser);

      const result = await userService.updateUser(1, updateData);

      expect(result).toEqual(updatedUser);
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ userId: 1 });
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should return null if user not found', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(null);

      const result = await userService.updateUser(999, { username: 'newuser' });

      expect(result).toBeNull();
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      const mockUser = { userId: 1, username: 'testuser', beneficiary: null };
      mockQueryRunner.manager.findOne.mockResolvedValue(mockUser);
      mockQueryRunner.manager.delete.mockResolvedValue({ affected: 1 });

      const result = await userService.deleteUser(1);

      expect(result).toBe(true);
      expect(mockQueryRunner.connect).toHaveBeenCalled();
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });

    it('should delete user with beneficiary', async () => {
      const mockUser = { 
        userId: 1, 
        username: 'testuser', 
        beneficiary: { beneficiaryId: 1 } 
      };
      mockQueryRunner.manager.findOne.mockResolvedValue(mockUser);
      mockQueryRunner.manager.delete.mockResolvedValue({ affected: 1 });

      const result = await userService.deleteUser(1);

      expect(result).toBe(true);
      expect(mockQueryRunner.manager.delete).toHaveBeenCalledWith(Beneficiary, 1);
      expect(mockQueryRunner.manager.delete).toHaveBeenCalledWith(User, 1);
    });

    it('should return false if user not found', async () => {
      mockQueryRunner.manager.findOne.mockResolvedValue(null);

      const result = await userService.deleteUser(999);

      expect(result).toBe(false);
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });
  });

  describe('findBeneficiaryById', () => {
    it('should return beneficiary by ID', async () => {
      const mockBeneficiary = { beneficiaryId: 1, discountCategory: 'GENERAL' };
      mockBeneficiaryRepository.findOne.mockResolvedValue(mockBeneficiary);

      const result = await userService.findBeneficiaryById(1);

      expect(result).toEqual(mockBeneficiary);
      expect(mockBeneficiaryRepository.findOne).toHaveBeenCalledWith({
        where: { beneficiaryId: 1 },
        relations: ['user']
      });
    });
  });

  describe('getAllBeneficiaries', () => {
    it('should return all beneficiaries', async () => {
      const mockBeneficiaries = [
        { beneficiaryId: 1, discountCategory: 'GENERAL', discount: 0.1 },
        { beneficiaryId: 2, discountCategory: 'SENIOR', discount: 0.15 }
      ];
      mockBeneficiaryRepository.find.mockResolvedValue(mockBeneficiaries);

      const result = await userService.getAllBeneficiaries();

      expect(result).toEqual(mockBeneficiaries);
      expect(mockBeneficiaryRepository.find).toHaveBeenCalledWith({
        relations: ['user']
      });
    });
  });

  describe('updateBeneficiary', () => {
    it('should update existing beneficiary', async () => {
      const existingBeneficiary = { beneficiaryId: 1, discountCategory: 'GENERAL', discount: 0.1 };
      const updateData = { discountCategory: 'SENIOR', discount: 0.15 };
      const updatedBeneficiary = { ...existingBeneficiary, ...updateData };

      mockBeneficiaryRepository.findOne.mockResolvedValue(existingBeneficiary);
      mockBeneficiaryRepository.save.mockResolvedValue(updatedBeneficiary);

      const result = await userService.updateBeneficiary(1, updateData);

      expect(result).toEqual(updatedBeneficiary);
      expect(mockBeneficiaryRepository.findOne).toHaveBeenCalledWith({
        where: { beneficiaryId: 1 },
        relations: ['user']
      });
      expect(mockBeneficiaryRepository.save).toHaveBeenCalled();
    });

    it('should return null if beneficiary not found', async () => {
      mockBeneficiaryRepository.findOne.mockResolvedValue(null);

      const result = await userService.updateBeneficiary(999, { discountCategory: 'SENIOR' });

      expect(result).toBeNull();
    });
  });

  describe('deleteBeneficiary', () => {
    it('should delete beneficiary successfully', async () => {
      const mockBeneficiary = { 
        beneficiaryId: 1, 
        discountCategory: 'GENERAL',
        user: { userId: 1, username: 'testuser' }
      };
      mockQueryRunner.manager.findOne.mockResolvedValue(mockBeneficiary);
      mockQueryRunner.manager.delete.mockResolvedValue({ affected: 1 });

      const result = await userService.deleteBeneficiary(1);

      expect(result).toBe(true);
      expect(mockQueryRunner.connect).toHaveBeenCalled();
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.manager.delete).toHaveBeenCalledWith(Beneficiary, 1);
      expect(mockQueryRunner.manager.delete).toHaveBeenCalledWith(User, 1);
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });

    it('should delete beneficiary without user', async () => {
      const mockBeneficiary = { 
        beneficiaryId: 1, 
        discountCategory: 'GENERAL',
        user: null
      };
      mockQueryRunner.manager.findOne.mockResolvedValue(mockBeneficiary);
      mockQueryRunner.manager.delete.mockResolvedValue({ affected: 1 });

      const result = await userService.deleteBeneficiary(1);

      expect(result).toBe(true);
      expect(mockQueryRunner.manager.delete).toHaveBeenCalledWith(Beneficiary, 1);
      expect(mockQueryRunner.manager.delete).not.toHaveBeenCalledWith(User, expect.any(Number));
    });

    it('should return false if beneficiary not found', async () => {
      mockQueryRunner.manager.findOne.mockResolvedValue(null);

      const result = await userService.deleteBeneficiary(999);

      expect(result).toBe(false);
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });
  });

  describe('createBeneficiary', () => {
    it('should create beneficiary with user', async () => {
      const userData = { username: 'beneficiary', credentials: 'password123' };
      const beneficiaryData = { discountCategory: 'GENERAL', discount: 0.1 };

      const mockUser = { userId: 1, username: 'beneficiary' };
      const mockBeneficiary = { beneficiaryId: 1, ...beneficiaryData, user: mockUser };

      // Mock the manager methods
      const mockUserRepo = {
        create: jest.fn().mockReturnValue(mockUser),
        save: jest.fn().mockResolvedValue(mockUser)
      };
      const mockBeneficiaryRepo = {
        create: jest.fn().mockReturnValue(mockBeneficiary),
        save: jest.fn().mockResolvedValue(mockBeneficiary)
      };

      mockQueryRunner.manager.findOne.mockResolvedValue(null); // No existing user
      mockQueryRunner.manager.getRepository
        .mockReturnValueOnce(mockUserRepo)
        .mockReturnValueOnce(mockBeneficiaryRepo);
      mockQueryRunner.manager.save
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(mockBeneficiary);

      const result = await userService.createBeneficiary(userData, beneficiaryData);

      expect(mockQueryRunner.connect).toHaveBeenCalled();
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
      expect(result).toEqual(mockBeneficiary);
    });

    it('should throw error if username already exists', async () => {
      const userData = { username: 'existinguser', credentials: 'password123' };
      const beneficiaryData = { discountCategory: 'GENERAL', discount: 0.1 };

      mockQueryRunner.manager.findOne.mockResolvedValue({ userId: 1, username: 'existinguser' });

      await expect(userService.createBeneficiary(userData, beneficiaryData))
        .rejects.toThrow('Username already exists');
    });
  });

  describe('getAllRoles', () => {
    it('should return all roles with permissions', async () => {
      const mockRoles = [
        { roleId: 1, roleName: 'ADMIN', permissions: [] },
        { roleId: 2, roleName: 'USER', permissions: [] }
      ];

      mockRoleRepository.find.mockResolvedValue(mockRoles);

      const result = await userService.getAllRoles();

      expect(result).toEqual(mockRoles);
      expect(mockRoleRepository.find).toHaveBeenCalledWith({
        relations: ['permissions']
      });
    });
  });

  describe('createRole', () => {
    it('should create new role', async () => {
      const roleData = { roleName: 'NEW_ROLE', description: 'New role' };
      const mockRole = { roleId: 1, ...roleData };

      mockRoleRepository.create.mockReturnValue(mockRole);
      mockRoleRepository.save.mockResolvedValue(mockRole);

      const result = await userService.createRole(roleData);

      expect(result).toEqual(mockRole);
      expect(mockRoleRepository.create).toHaveBeenCalledWith(roleData);
      expect(mockRoleRepository.save).toHaveBeenCalled();
    });
  });

  describe('updateRole', () => {
    it('should update existing role', async () => {
      const existingRole = { roleId: 1, roleName: 'OLD_ROLE' };
      const updateData = { roleName: 'NEW_ROLE' };
      const updatedRole = { ...existingRole, ...updateData };

      mockRoleRepository.findOneBy.mockResolvedValue(existingRole);
      mockRoleRepository.save.mockResolvedValue(updatedRole);

      const result = await userService.updateRole(1, updateData);

      expect(result).toEqual(updatedRole);
      expect(mockRoleRepository.findOneBy).toHaveBeenCalledWith({ roleId: 1 });
      expect(mockRoleRepository.save).toHaveBeenCalled();
    });

    it('should return null if role not found', async () => {
      mockRoleRepository.findOneBy.mockResolvedValue(null);

      const result = await userService.updateRole(999, { roleName: 'NEW_ROLE' });

      expect(result).toBeNull();
    });
  });

  describe('deleteRole', () => {
    it('should delete role successfully', async () => {
      mockRoleRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await userService.deleteRole(1);

      expect(result).toBe(true);
      expect(mockRoleRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should return false if role not found', async () => {
      mockRoleRepository.delete.mockResolvedValue({ affected: 0 });

      const result = await userService.deleteRole(999);

      expect(result).toBe(false);
    });
  });

  describe('getAllPermissions', () => {
    it('should return all permissions', async () => {
      const mockPermissions = [
        { permissionsId: 1, permissionName: 'user:read' },
        { permissionsId: 2, permissionName: 'user:write' }
      ];

      mockPermissionRepository.find.mockResolvedValue(mockPermissions);

      const result = await userService.getAllPermissions();

      expect(result).toEqual(mockPermissions);
      expect(mockPermissionRepository.find).toHaveBeenCalled();
    });
  });

  describe('findPersonByRut', () => {
    it('should return person by RUT', async () => {
      const mockPerson = { rut: '12345678-9', name: 'John', lastname: 'Doe' };
      mockPersonRepository.findOne.mockResolvedValue(mockPerson);

      const result = await userService.findPersonByRut('12345678-9');

      expect(result).toEqual(mockPerson);
      expect(mockPersonRepository.findOne).toHaveBeenCalledWith({
        where: { rut: '12345678-9' },
        relations: ['beneficiary']
      });
    });
  });

  describe('createPerson', () => {
    it('should create new person', async () => {
      const personData = { rut: '12345678-9', name: 'John', lastname: 'Doe' };
      const mockPerson = { ...personData };

      mockPersonRepository.create.mockReturnValue(mockPerson);
      mockPersonRepository.save.mockResolvedValue(mockPerson);

      const result = await userService.createPerson(personData);

      expect(result).toEqual(mockPerson);
      expect(mockPersonRepository.create).toHaveBeenCalledWith(personData);
      expect(mockPersonRepository.save).toHaveBeenCalled();
    });
  });
}); 