import AppDataSource from '../config/data-source';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
import { Beneficiary } from '../entities/beneficiary.entity';
import { Person } from '../entities/person.entity';
import * as bcrypt from 'bcrypt';

export async function seedDatabase() {
  try {
    await AppDataSource.initialize();
    console.log('Database connection established');

    // Create permissions
    const permissions = [
      { permissionName: 'user:read', description: 'Read user information' },
      { permissionName: 'user:write', description: 'Create and update users' },
      { permissionName: 'user:delete', description: 'Delete users' },
      { permissionName: 'role:read', description: 'Read role information' },
      { permissionName: 'role:write', description: 'Create and update roles' },
      { permissionName: 'role:delete', description: 'Delete roles' },
      { permissionName: 'permission:read', description: 'Read permission information' },
      { permissionName: 'permission:write', description: 'Create and update permissions' },
      { permissionName: 'beneficiary:read', description: 'Read beneficiary information' },
      { permissionName: 'beneficiary:write', description: 'Create and update beneficiaries' }
    ];

    const permissionRepository = AppDataSource.getRepository(Permission);
    const createdPermissions = [];
    
    for (const permData of permissions) {
      let permission = await permissionRepository.findOne({
        where: { permissionName: permData.permissionName }
      });
      
      if (!permission) {
        permission = permissionRepository.create(permData);
        permission = await permissionRepository.save(permission);
        console.log(`Created permission: ${permission.permissionName}`);
      }
      createdPermissions.push(permission);
    }

    // Create roles
    const roles = [
      { roleName: 'ADMIN', description: 'Administrator with full access' },
      { roleName: 'FARMACEUTICO', description: 'Pharmacist with limited access' },
      { roleName: 'CAJERO', description: 'Cashier with transaction access' },
      { roleName: 'BENEFICIARIO', description: 'Beneficiary with basic access' }
    ];

    const roleRepository = AppDataSource.getRepository(Role);
    const createdRoles = [];
    
    for (const roleData of roles) {
      let role = await roleRepository.findOne({
        where: { roleName: roleData.roleName }
      });
      
      if (!role) {
        role = roleRepository.create(roleData);
        role = await roleRepository.save(role);
        console.log(`Created role: ${role.roleName}`);
      }
      createdRoles.push(role);
    }

    // Assign permissions to roles
    const adminRole = createdRoles.find(r => r.roleName === 'ADMIN');
    if (adminRole) {
      adminRole.permissions = createdPermissions;
      await roleRepository.save(adminRole);
      console.log('Assigned all permissions to ADMIN role');
    }

    const farmaceuticoRole = createdRoles.find(r => r.roleName === 'FARMACEUTICO');
    if (farmaceuticoRole) {
      farmaceuticoRole.permissions = createdPermissions.filter(p => 
        p.permissionName.includes('beneficiary') || p.permissionName.includes('user:read')
      );
      await roleRepository.save(farmaceuticoRole);
      console.log('Assigned permissions to FARMACEUTICO role');
    }

    const cajeroRole = createdRoles.find(r => r.roleName === 'CAJERO');
    if (cajeroRole) {
      cajeroRole.permissions = createdPermissions.filter(p => 
        p.permissionName.includes('beneficiary:read')
      );
      await roleRepository.save(cajeroRole);
      console.log('Assigned permissions to CAJERO role');
    }

    // Create admin user
    const userRepository = AppDataSource.getRepository(User);
    let adminUser = await userRepository.findOne({
      where: { username: 'admin' }
    });

    if (!adminUser) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123' + salt, 10);
      
      adminUser = userRepository.create({
        username: 'admin',
        credentials: hashedPassword,
        salt: salt,
        roles: [adminRole]
      });
      
      adminUser = await userRepository.save(adminUser);
      console.log('Created admin user');
    }

    // Create a sample beneficiary
    const beneficiaryRepository = AppDataSource.getRepository(Beneficiary);
    const personRepository = AppDataSource.getRepository(Person);
    
    let beneficiary = await beneficiaryRepository.findOne({
      where: { user: adminUser }
    });

    if (!beneficiary) {
      beneficiary = beneficiaryRepository.create({
        discountCategory: 'GENERAL',
        discount: 0.10,
        user: adminUser
      });
      
      beneficiary = await beneficiaryRepository.save(beneficiary);
      console.log('Created sample beneficiary');
    }

    // Create a sample person
    let person = await personRepository.findOne({
      where: { rut: '12345678-9' }
    });

    if (!person) {
      person = personRepository.create({
        rut: '12345678-9',
        name: 'Juan',
        lastname: 'Pérez',
        beneficiary: beneficiary
      });
      
      person = await personRepository.save(person);
      console.log('Created sample person');
    }

    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await AppDataSource.destroy();
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
} 