import { RolesService } from '../services/roles.service';

export class RolesController {
    constructor(private rolesService: RolesService) {}

    async createRole(req: import('express').Request, res: import('express').Response) {
        try {
            const roleData = req.body;
            const newRole = await this.rolesService.createRole(roleData);
            res.status(201).json(newRole);
        } catch (error) {
            res.status(500).json({ message: 'Error creating role', error });
        }
    }

    async getRoles(req: import('express').Request, res: import('express').Response) {
        try {
            const roles = await this.rolesService.getRoles();
            res.status(200).json(roles);
        } catch (error) {
            res.status(500).json({ message: 'Error retrieving roles', error });
        }
    }
}