import { Repository } from 'typeorm';
import AppDataSource from '../config/data-source';
import { Role } from '../entities/role.entity';

export class RolesService {
    private roleRepository: Repository<Role>;

    constructor() {
        this.roleRepository = AppDataSource.getRepository(Role);
    }

    public async createRole(roleData: Partial<Role>): Promise<Role> {
        const role = this.roleRepository.create(roleData);
        return this.roleRepository.save(role);
    }

    public async getRoles(): Promise<Role[]> {
        return this.roleRepository.find({
            relations: ['permissions']
        });
    }

    public async getRoleById(roleId: number): Promise<Role | null> {
        return this.roleRepository.findOne({
            where: { roleId },
            relations: ['permissions']
        });
    }

    public async updateRole(roleId: number, roleData: Partial<Role>): Promise<Role | null> {
        const role = await this.roleRepository.findOneBy({ roleId });
        if (!role) {
            return null;
        }
        
        Object.assign(role, roleData);
        return this.roleRepository.save(role);
    }

    public async deleteRole(roleId: number): Promise<boolean> {
        const result = await this.roleRepository.delete(roleId);
        return result.affected === 1;
    }
}