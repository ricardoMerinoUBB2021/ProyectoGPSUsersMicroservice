import { Repository } from 'typeorm';
import AppDataSource from '../config/data-source';
import { Usuario, TipoUsuario } from '../entities/user.entity';
import { Beneficiario } from '../entities/beneficiary.entity';
import { Rol } from '../entities/role.entity';
import { Permiso } from '../entities/permission.entity';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

export class UserService {
  private userRepository: Repository<Usuario>;
  private beneficiaryRepository: Repository<Beneficiario>;
  private roleRepository: Repository<Rol>;
  private permissionRepository: Repository<Permiso>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(Usuario);
    this.beneficiaryRepository = AppDataSource.getRepository(Beneficiario);
    this.roleRepository = AppDataSource.getRepository(Rol);
    this.permissionRepository = AppDataSource.getRepository(Permiso);
  }

  async findAllUsers(page: number = 1, limit: number = 10): Promise<{ users: Usuario[], total: number }> {
    const [users, total] = await this.userRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
    });
    return { users, total };
  }

  async findUserById(id: string): Promise<Usuario | null> {
    return this.userRepository.findOneBy({ id });
  }

  async createUser(userData: Partial<Usuario>): Promise<Usuario> {
    // Hash password if provided
    if (userData.credenciales && userData.credenciales.passwordHash) {
      userData.credenciales.passwordHash = await bcrypt.hash(userData.credenciales.passwordHash, 10);
    }
    
    // Create the user entity
    const user = this.userRepository.create(userData);
    
    // Explicitly set ID if it's not already set
    if (!user.id) {
      user.id = uuidv4();
    }
    
    return this.userRepository.save(user);
  }

  async updateUser(id: string, userData: Partial<Usuario>): Promise<Usuario | null> {
    // Check if user exists
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      return null;
    }

    // Hash password if updated
    if (userData.credenciales && userData.credenciales.passwordHash) {
      userData.credenciales.passwordHash = await bcrypt.hash(userData.credenciales.passwordHash, 10);
    }

    // Update and save
    Object.assign(user, userData);
    return this.userRepository.save(user);
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await this.userRepository.update(id, { activo: false });
    return result.affected === 1;
  }

  // Beneficiary specific methods
  async findBeneficiaryById(id: string): Promise<Beneficiario | null> {
    return this.beneficiaryRepository.findOneBy({ id });
  }

  async getBeneficiaryHistory(id: string): Promise<any[]> {
    const beneficiary = await this.beneficiaryRepository.findOneBy({ id });
    return beneficiary?.historialCompras || [];
  }

  async getBeneficiaryPrescriptions(id: string): Promise<any[]> {
    const beneficiary = await this.beneficiaryRepository.findOneBy({ id });
    return beneficiary?.recetas || [];
  }

  async createBeneficiary(userData: Partial<Usuario>, beneficiaryData: Partial<Beneficiario>): Promise<Beneficiario> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      // Set user type to BENEFICIARIO
      userData.tipo = TipoUsuario.BENEFICIARIO;
      
      // Hash password if provided
      if (userData.credenciales && userData.credenciales.passwordHash) {
        userData.credenciales.passwordHash = await bcrypt.hash(userData.credenciales.passwordHash, 10);
      }
      
      // Create the user entity
      const userRepository = queryRunner.manager.getRepository(Usuario);
      const user = userRepository.create(userData);
      
      // Explicitly set ID if it's not already set
      if (!user.id) {
        user.id = uuidv4();
      }
      
      const savedUser = await queryRunner.manager.save(user);
      
      // Create beneficiary with the user's ID
      const beneficiaryRepository = queryRunner.manager.getRepository(Beneficiario);
      const beneficiary = beneficiaryRepository.create({
        ...beneficiaryData,
        id: savedUser.id, // Link beneficiary to user with same ID
      });
      
      const savedBeneficiary = await queryRunner.manager.save(beneficiary);
      
      // Commit transaction
      await queryRunner.commitTransaction();
      
      return savedBeneficiary;
    } catch (error) {
      // Rollback transaction on error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }

  // Role methods
  async getAllRoles(): Promise<Rol[]> {
    return this.roleRepository.find();
  }

  async createRole(roleData: Partial<Rol>): Promise<Rol> {
    const role = this.roleRepository.create(roleData);
    return this.roleRepository.save(role);
  }

  async updateRole(id: string, roleData: Partial<Rol>): Promise<Rol | null> {
    const role = await this.roleRepository.findOneBy({ id });
    if (!role) {
      return null;
    }
    
    Object.assign(role, roleData);
    return this.roleRepository.save(role);
  }

  async deleteRole(id: string): Promise<boolean> {
    const result = await this.roleRepository.delete(id);
    return result.affected === 1;
  }

  // Permission methods
  async getAllPermissions(): Promise<Permiso[]> {
    return this.permissionRepository.find();
  }
} 