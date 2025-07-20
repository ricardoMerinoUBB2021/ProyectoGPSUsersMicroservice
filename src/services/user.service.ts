import { Repository } from 'typeorm';
import AppDataSource from '../config/data-source';
import { User } from '../entities/user.entity';
import { Beneficiary } from '../entities/beneficiary.entity';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
import { Person } from '../entities/person.entity';
import * as bcrypt from 'bcrypt';

export class UserService {
  private userRepository: Repository<User>;
  private beneficiaryRepository: Repository<Beneficiary>;
  private roleRepository: Repository<Role>;
  private permissionRepository: Repository<Permission>;
  private personRepository: Repository<Person>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
    this.beneficiaryRepository = AppDataSource.getRepository(Beneficiary);
    this.roleRepository = AppDataSource.getRepository(Role);
    this.permissionRepository = AppDataSource.getRepository(Permission);
    this.personRepository = AppDataSource.getRepository(Person);
  }

  async findAllUsers(page: number = 1, limit: number = 10): Promise<{ users: User[], total: number }> {
    const [users, total] = await this.userRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      relations: ['roles', 'beneficiary']
    });
    return { users, total };
  }

  async findUserById(userId: number): Promise<User | null> {
    return this.userRepository.findOne({
      where: { userId },
      relations: ['roles', 'beneficiary']
    });
  }

  async findUserByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { username },
      relations: ['roles', 'beneficiary']
    });
  }

  async createUser(userData: Partial<User>): Promise<User> {
    // Hash password if provided
    if (userData.credentials) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.credentials, salt);
      userData.credentials = hashedPassword;
      userData.salt = salt;
    }
    
    // Create the user entity
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  async updateUser(userId: number, userData: Partial<User>): Promise<User | null> {
    // Check if user exists
    const user = await this.userRepository.findOneBy({ userId });
    if (!user) {
      return null;
    }

    // Hash password if updated
    if (userData.credentials) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.credentials, salt);
      userData.credentials = hashedPassword;
      userData.salt = salt;
    }

    // Update and save
    Object.assign(user, userData);
    return this.userRepository.save(user);
  }

  async deleteUser(userId: number): Promise<boolean> {
    const result = await this.userRepository.delete(userId);
    return result.affected === 1;
  }

  // Beneficiary specific methods
  async findBeneficiaryById(beneficiaryId: number): Promise<Beneficiary | null> {
    return this.beneficiaryRepository.findOne({
      where: { beneficiaryId },
      relations: ['user']
    });
  }

  async createBeneficiary(userData: Partial<User>, beneficiaryData: Partial<Beneficiary>): Promise<Beneficiary> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      // Hash password if provided
      if (userData.credentials) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.credentials, salt);
        userData.credentials = hashedPassword;
        userData.salt = salt;
      }
      
      // Create the user entity
      const userRepository = queryRunner.manager.getRepository(User);
      const user = userRepository.create(userData);
      const savedUser = await queryRunner.manager.save(user);
      
      // Create beneficiary with the user's ID
      const beneficiaryRepository = queryRunner.manager.getRepository(Beneficiary);
      const beneficiary = beneficiaryRepository.create({
        ...beneficiaryData,
        user: savedUser,
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
  async getAllRoles(): Promise<Role[]> {
    return this.roleRepository.find({
      relations: ['permissions']
    });
  }

  async createRole(roleData: Partial<Role>): Promise<Role> {
    const role = this.roleRepository.create(roleData);
    return this.roleRepository.save(role);
  }

  async updateRole(roleId: number, roleData: Partial<Role>): Promise<Role | null> {
    const role = await this.roleRepository.findOneBy({ roleId });
    if (!role) {
      return null;
    }
    
    Object.assign(role, roleData);
    return this.roleRepository.save(role);
  }

  async deleteRole(roleId: number): Promise<boolean> {
    const result = await this.roleRepository.delete(roleId);
    return result.affected === 1;
  }

  // Permission methods
  async getAllPermissions(): Promise<Permission[]> {
    return this.permissionRepository.find();
  }

  // Person methods
  async findPersonByRut(rut: string): Promise<Person | null> {
    return this.personRepository.findOne({
      where: { rut },
      relations: ['beneficiary']
    });
  }

  async createPerson(personData: Partial<Person>): Promise<Person> {
    const person = this.personRepository.create(personData);
    return this.personRepository.save(person);
  }
} 