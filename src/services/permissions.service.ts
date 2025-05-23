export class PermissionsService {
    private permissions: { id: string; name: string }[] = [];

    constructor() {
        // Initialize with some default permissions if needed
    }

    public createPermission(name: string): { id: string; name: string } {
        const newPermission = { id: this.generateId(), name };
        this.permissions.push(newPermission);
        return newPermission;
    }

    public getPermissions(): { id: string; name: string }[] {
        return this.permissions;
    }

    public getPermissionById(id: string): { id: string; name: string } | undefined {
        return this.permissions.find(permission => permission.id === id);
    }

    private generateId(): string {
        return (Math.random() * 100000).toFixed(0);
    }
}