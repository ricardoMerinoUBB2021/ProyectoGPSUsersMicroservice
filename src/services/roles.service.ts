export class RolesService {
    private roles: Role[] = [];

    public createRole(name: string): Role {
        const newRole: Role = {
            id: this.generateId(),
            name: name
        };
        this.roles.push(newRole);
        return newRole;
    }

    public getRoles(): Role[] {
        return this.roles;
    }

    public getRoleById(id: string): Role | undefined {
        return this.roles.find(role => role.id === id);
    }

    private generateId(): string {
        return (this.roles.length + 1).toString();
    }
}

interface Role {
    id: string;
    name: string;
}