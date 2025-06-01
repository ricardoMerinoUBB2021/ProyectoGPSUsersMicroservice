import { AuthService } from '../src/services/auth.service';
import { Usuario } from '../src/entities/user.entity';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

const mockRepository = {
  find: jest.fn(),
  findOneBy: jest.fn(),
  save: jest.fn(),
};

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
    // @ts-ignore
    authService.userRepository = mockRepository;
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return user info on valid login', async () => {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const user = {
        id: '1',
        rut: '12345678-9',
        nombres: 'Test',
        apellidos: 'User',
        fechaNacimiento: '2000-01-01',
        tipo: 'admin',
        credenciales: {
          username: 'admin',
          passwordHash: hashedPassword,
          ultimoAcceso: new Date().toISOString(),
          intentosFallidos: 0,
          bloqueado: false
        },
        permisos: [],
        beneficiarios: [],
        roles: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as Usuario;
      mockRepository.find.mockResolvedValue([user]);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      const result = await authService.login('admin', 'admin123');
      expect(result).toHaveProperty('user');
      expect(result?.user).toHaveProperty('id', '1');
    });

    it('should return null for invalid user', async () => {
      mockRepository.find.mockResolvedValue([]);
      const result = await authService.login('notfound', 'password');
      expect(result).toBeNull();
    });

    it('should return null for invalid password', async () => {
      const user = {
        id: '1',
        tipo: 'admin',
        permisos: ['read'],
        credenciales: {
          username: 'test',
          passwordHash: 'hash',
          bloqueado: false,
          intentosFallidos: 0,
        },
      } as unknown as Usuario;
      mockRepository.find.mockResolvedValue([user]);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      const result = await authService.login('test', 'wrong');
      expect(result).toBeNull();
    });
  });

  describe('getUserProfile', () => {
    it('should return user profile if found', async () => {
      const user = {
        id: '1',
        rut: '12345678-9',
        nombres: 'Test',
        apellidos: 'User',
        fechaNacimiento: '2000-01-01',
        tipo: 'admin',
        credenciales: {},
        permisos: [],
        beneficiarios: [],
        roles: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as Usuario;
      mockRepository.findOneBy.mockResolvedValue(user);
      const result = await authService.getUserProfile('1');
      expect(result).toHaveProperty('id', '1');
    });
    it('should return null if user not found', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);
      const result = await authService.getUserProfile('2');
      expect(result).toBeNull();
    });
  });

  describe('changePassword', () => {
    it('should change password if current password is valid', async () => {
      const user = { id: '1', credenciales: { passwordHash: 'hash' } } as Usuario;
      mockRepository.findOneBy.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('newhash');
      mockRepository.save.mockResolvedValue(user);
      const result = await authService.changePassword('1', 'old', 'new');
      expect(result).toBe(true);
    });
    it('should return false if user not found', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);
      const result = await authService.changePassword('2', 'old', 'new');
      expect(result).toBe(false);
    });
    it('should return false if current password is invalid', async () => {
      const user = { id: '1', credenciales: { passwordHash: 'hash' } } as Usuario;
      mockRepository.findOneBy.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      const result = await authService.changePassword('1', 'wrong', 'new');
      expect(result).toBe(false);
    });
  });
}); 