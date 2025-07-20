import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { User } from '../entities/user.entity';

// Augment the Express Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export class AuthMiddleware {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  // Middleware to verify JWT token and set user in request
  verifyToken = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        res.status(401).json({
          status: 'error',
          message: 'Token de autenticación requerido'
        });
        return;
      }

      // TODO: Implement JWT verification logic
      // For now, we'll just pass through
      // const decoded = jwt.verify(token, process.env.JWT_SECRET!);
      // req.user = decoded;
      
      next();
    } catch (error: any) {
      res.status(401).json({
        status: 'error',
        message: 'Token inválido',
        error: error.message || 'Error desconocido'
      });
    }
  };

  // Middleware to check if user has required permission
  hasPermission = (requiredPermission: string) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        if (!req.user) {
          res.status(401).json({
            status: 'error',
            message: 'Usuario no autenticado'
          });
          return;
        }

        if (!this.authService.hasPermission(req.user, requiredPermission)) {
          res.status(403).json({
            status: 'error',
            message: 'No tiene permisos para acceder a este recurso'
          });
          return;
        }
        next();
      } catch (error: any) {
        res.status(500).json({
          status: 'error',
          message: 'Error al verificar permisos',
          error: error.message || 'Error desconocido'
        });
      }
    };
  };

  // Middleware to check if user has any of the required roles
  hasRole = (requiredRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        if (!req.user) {
          res.status(401).json({
            status: 'error',
            message: 'Usuario no autenticado'
          });
          return;
        }

        const userRoles = req.user.roles?.map(role => role.roleName) || [];
        const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
        
        if (!hasRequiredRole) {
          res.status(403).json({
            status: 'error',
            message: 'No tiene el rol necesario para acceder a este recurso'
          });
          return;
        }
        next();
      } catch (error: any) {
        res.status(500).json({
          status: 'error',
          message: 'Error al verificar rol',
          error: error.message || 'Error desconocido'
        });
      }
    };
  };
}