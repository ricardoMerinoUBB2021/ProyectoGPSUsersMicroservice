import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';

// Augment the Express Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export class AuthMiddleware {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  // Middleware to verify JWT token
  verifyToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Get token from authorization header
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
          status: 'error',
          message: 'No se proporcionó un token válido'
        });
        return;
      }
      
      const token = authHeader.split(' ')[1];
      const decoded = await this.authService.validateToken(token);
      
      if (!decoded) {
        res.status(401).json({
          status: 'error',
          message: 'Token inválido o expirado'
        });
        return;
      }
      
      // Attach user info to request
      req.user = decoded;
      next();
    } catch (error: any) {
      res.status(401).json({
        status: 'error',
        message: 'Error de autenticación',
        error: error.message || 'Error desconocido'
      });
    }
  };

  // Middleware to check if user has required permission
  hasPermission = (requiredPermission: string) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        const userPermisos = req.user?.permisos || [];
        
        if (!this.authService.hasPermission(userPermisos, requiredPermission)) {
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
        const userRole = req.user?.tipo;
        
        if (!userRole || !requiredRoles.includes(userRole)) {
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