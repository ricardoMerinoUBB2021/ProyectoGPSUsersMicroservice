import { Repository } from 'typeorm';
import AppDataSource from '../config/data-source';
import { Permission } from '../entities/permission.entity';

export class PermissionsService {
    private permissionRepository: Repository<Permission>;

    constructor() {
        this.permissionRepository = AppDataSource.getRepository(Permission);
    }

    public async createPermission(permissionData: Partial<Permission>): Promise<Permission> {
        const permission = this.permissionRepository.create(permissionData);
        return this.permissionRepository.save(permission);
    }

    public async getPermissions(): Promise<Permission[]> {
        return this.permissionRepository.find();
    }

    public async getPermissionById(permissionsId: number): Promise<Permission | null> {
        return this.permissionRepository.findOneBy({ permissionsId });
    }

    public async updatePermission(permissionsId: number, permissionData: Partial<Permission>): Promise<Permission | null> {
        const permission = await this.permissionRepository.findOneBy({ permissionsId });
        if (!permission) {
            return null;
        }
        
        Object.assign(permission, permissionData);
        return this.permissionRepository.save(permission);
    }

    public async deletePermission(permissionsId: number): Promise<boolean> {
        const result = await this.permissionRepository.delete(permissionsId);
        return result.affected === 1;
    }
}