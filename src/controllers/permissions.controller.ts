import { Request, Response } from 'express';
import { PermissionsService } from '../services/permissions.service';

export class PermissionsController {
    private permissionsService: PermissionsService;

    constructor() {
        this.permissionsService = new PermissionsService();
    }

    async createPermission(req: Request, res: Response): Promise<void> {
        try {
            const newPermission = await this.permissionsService.createPermission(req.body);
            res.status(201).json({
                status: 'success',
                message: 'Permiso creado exitosamente',
                data: { permission: newPermission }
            });
        } catch (error: any) {
            res.status(400).json({
                status: 'error',
                message: 'Error al crear permiso',
                error: error.message || 'Error desconocido'
            });
        }
    }

    async getAllPermissions(req: Request, res: Response): Promise<void> {
        try {
            const permissions = await this.permissionsService.getPermissions();
            res.status(200).json({
                status: 'success',
                data: { permissions }
            });
        } catch (error: any) {
            res.status(500).json({
                status: 'error',
                message: 'Error al obtener permisos',
                error: error.message || 'Error desconocido'
            });
        }
    }

    async getPermissionById(req: Request, res: Response): Promise<void> {
        try {
            const permissionsId = parseInt(req.params.id, 10);
            const permission = await this.permissionsService.getPermissionById(permissionsId);
            
            if (!permission) {
                res.status(404).json({
                    status: 'error',
                    message: 'Permiso no encontrado'
                });
                return;
            }
            
            res.status(200).json({
                status: 'success',
                data: { permission }
            });
        } catch (error: any) {
            res.status(500).json({
                status: 'error',
                message: 'Error al obtener permiso',
                error: error.message || 'Error desconocido'
            });
        }
    }

    async updatePermission(req: Request, res: Response): Promise<void> {
        try {
            const permissionsId = parseInt(req.params.id, 10);
            const updatedPermission = await this.permissionsService.updatePermission(permissionsId, req.body);
            
            if (!updatedPermission) {
                res.status(404).json({
                    status: 'error',
                    message: 'Permiso no encontrado'
                });
                return;
            }
            
            res.status(200).json({
                status: 'success',
                message: 'Permiso actualizado exitosamente',
                data: { permission: updatedPermission }
            });
        } catch (error: any) {
            res.status(400).json({
                status: 'error',
                message: 'Error al actualizar permiso',
                error: error.message || 'Error desconocido'
            });
        }
    }

    async deletePermission(req: Request, res: Response): Promise<void> {
        try {
            const permissionsId = parseInt(req.params.id, 10);
            const deleted = await this.permissionsService.deletePermission(permissionsId);
            
            if (!deleted) {
                res.status(404).json({
                    status: 'error',
                    message: 'Permiso no encontrado'
                });
                return;
            }
            
            res.status(200).json({
                status: 'success',
                message: 'Permiso eliminado exitosamente'
            });
        } catch (error: any) {
            res.status(500).json({
                status: 'error',
                message: 'Error al eliminar permiso',
                error: error.message || 'Error desconocido'
            });
        }
    }
}