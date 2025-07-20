import { Request, Response, NextFunction } from 'express';
import { User } from '../entities/user.entity';

// Augment the Express Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export const checkPermissions = (requiredPermissions: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ 
                status: 'error',
                message: 'Usuario no autenticado' 
            });
        }

        // Get all permissions from user's roles
        const userPermissions: string[] = [];
        req.user.roles?.forEach(role => {
            role.permissions?.forEach(permission => {
                userPermissions.push(permission.permissionName);
            });
        });

        const hasPermission = requiredPermissions.every(permission => 
            userPermissions.includes(permission)
        );

        if (!hasPermission) {
            return res.status(403).json({ 
                status: 'error',
                message: 'No tiene permisos para acceder a este recurso' 
            });
        }

        next();
    };
};