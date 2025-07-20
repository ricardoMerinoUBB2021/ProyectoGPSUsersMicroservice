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

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create mock repositories
    mockUserRepository = {
      findAndCount: jest.fn(),
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      update: jest.fn()
    };

    mockBeneficiaryRepository = {
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

    // Mock the getRepository method
    (AppDataSource.getRepository as jest.Mock).mockImplementation((entity) => {
      if (entity === User) return mockUserRepository;
      if (entity === Beneficiary) return mockBeneficiaryRepository;
      if (entity === Role) return mockRoleRepository;
      if (entity === Permission) return mockPermissionRepository;
      if (entity === Person) return mockPersonRepository;
      return {};
    });

    userService = new UserService();
  });

  describe('findAllUsers', () => {
    it('should return users with pagination', async () => {
      const mockUsers = [
        { userId: 1, username: 'user1' },
        { userId: 2, username: 'user2' }
      ];
      const mockTotal = 2;

      mockUserRepository.findAndCount.mockResolvedValue([mockUsers, mockTotal]);

      const result = await userService.findAllUsers(1, 10);

      expect(result.users).toEqual(mockUsers);
      expect(result.total).toBe(mockTotal);
      expect(mockUserRepository.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        relations: ['roles', 'beneficiary']
      });
    });

    it('should use default pagination values', async () => {
      mockUserRepository.findAndCount.mockResolvedValue([[], 0]);

      await userService.findAllUsers();

      expect(mockUserRepository.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
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
      mockUserRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await userService.deleteUser(1);

      expect(result).toBe(true);
      expect(mockUserRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should return false if user not found', async () => {
      mockUserRepository.delete.mockResolvedValue({ affected: 0 });

      const result = await userService.deleteUser(999);

      expect(result).toBe(false);
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

  describe('createBeneficiary', () => {
    it('should create beneficiary with user', async () => {
      const userData = { username: 'beneficiary', credentials: 'password123' };
      const beneficiaryData = { discountCategory: 'GENERAL', discount: 0.1 };

      const mockUser = { userId: 1, username: 'beneficiary' };
      const mockBeneficiary = { beneficiaryId: 1, ...beneficiaryData, user: mockUser };

      // Mock query runner
      const mockQueryRunner = {
        connect: jest.fn(),
        startTransaction: jest.fn(),
        manager: {
          getRepository: jest.fn().mockReturnValue({
            create: jest.fn().mockReturnValue(mockUser),
            save: jest.fn().mockResolvedValue(mockUser)
          }),
          save: jest.fn().mockResolvedValue(mockBeneficiary)
        },
        commitTransaction: jest.fn(),
        rollbackTransaction: jest.fn(),
        release: jest.fn()
      };

      (AppDataSource.createQueryRunner as jest.Mock).mockReturnValue(mockQueryRunner);

      const result = await userService.createBeneficiary(userData, beneficiaryData);

      expect(mockQueryRunner.connect).toHaveBeenCalled();
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
      expect(result).toEqual(mockBeneficiary);
    });
  });

  describe('getAllRoles', () => {
    it('should return all roles with permissions', async () => {
      const mockRoles = [
        { roleId: 1, roleName: 'ADMIN' },
        { roleId: 2, roleName: 'USER' }
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
      const roleData = { roleName: 'NEW_ROLE', description: 'New role description' };
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