import { Request, Response, NextFunction } from 'express';

// Define extended request that includes the user property
interface RequestWithUser extends Request {
    user: {
        permissions: string[]
    }
}

export const checkPermissions = (requiredPermissions: string[]) => {
    return (req: RequestWithUser, res: Response, next: NextFunction) => {
        const userPermissions = req.user.permissions;

        const hasPermission = requiredPermissions.every(permission => 
            userPermissions.includes(permission)
        );

        if (!hasPermission) {
            return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
        }

        next();
    };
};