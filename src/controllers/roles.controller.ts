import { Request, Response } from 'express';
import { RolesService } from '../services/roles.service';

export class RolesController {
    private rolesService: RolesService;

    constructor() {
        this.rolesService = new RolesService();
    }

    async createRole(req: Request, res: Response): Promise<void> {
        try {
            const newRole = await this.rolesService.createRole(req.body);
            res.status(201).json({
                status: 'success',
                message: 'Rol creado exitosamente',
                data: { role: newRole }
            });
        } catch (error: any) {
            res.status(400).json({
                status: 'error',
                message: 'Error al crear rol',
                error: error.message || 'Error desconocido'
            });
        }
    }

    async getRoles(req: Request, res: Response): Promise<void> {
        try {
            const roles = await this.rolesService.getRoles();
            res.status(200).json({
                status: 'success',
                data: { roles }
            });
        } catch (error: any) {
            res.status(500).json({
                status: 'error',
                message: 'Error al obtener roles',
                error: error.message || 'Error desconocido'
            });
        }
    }

    async getRoleById(req: Request, res: Response): Promise<void> {
        try {
            const roleId = parseInt(req.params.id, 10);
            const role = await this.rolesService.getRoleById(roleId);
            
            if (!role) {
                res.status(404).json({
                    status: 'error',
                    message: 'Rol no encontrado'
                });
                return;
            }
            
            res.status(200).json({
                status: 'success',
                data: { role }
            });
        } catch (error: any) {
            res.status(500).json({
                status: 'error',
                message: 'Error al obtener rol',
                error: error.message || 'Error desconocido'
            });
        }
    }

    async updateRole(req: Request, res: Response): Promise<void> {
        try {
            const roleId = parseInt(req.params.id, 10);
            const updatedRole = await this.rolesService.updateRole(roleId, req.body);
            
            if (!updatedRole) {
                res.status(404).json({
                    status: 'error',
                    message: 'Rol no encontrado'
                });
                return;
            }
            
            res.status(200).json({
                status: 'success',
                message: 'Rol actualizado exitosamente',
                data: { role: updatedRole }
            });
        } catch (error: any) {
            res.status(400).json({
                status: 'error',
                message: 'Error al actualizar rol',
                error: error.message || 'Error desconocido'
            });
        }
    }

    async deleteRole(req: Request, res: Response): Promise<void> {
        try {
            const roleId = parseInt(req.params.id, 10);
            const deleted = await this.rolesService.deleteRole(roleId);
            
            if (!deleted) {
                res.status(404).json({
                    status: 'error',
                    message: 'Rol no encontrado'
                });
                return;
            }
            
            res.status(200).json({
                status: 'success',
                message: 'Rol eliminado exitosamente'
            });
        } catch (error: any) {
            res.status(500).json({
                status: 'error',
                message: 'Error al eliminar rol',
                error: error.message || 'Error desconocido'
            });
        }
    }
}