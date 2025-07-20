import { Router } from 'express';
import { PermissionsController } from '../controllers/permissions.controller';
import { AuthMiddleware } from '../middlewares/auth.middleware';

export class PermissionsRoutes {
  private router: Router;
  private permissionsController: PermissionsController;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.router = Router();
    this.permissionsController = new PermissionsController();
    this.authMiddleware = new AuthMiddleware();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Permission management routes
    this.router.get(
      '/',
      //this.authMiddleware.verifyToken,
      this.permissionsController.getAllPermissions
    );

    this.router.get(
      '/:id',
      //this.authMiddleware.verifyToken,
      this.permissionsController.getPermissionById
    );

    this.router.post(
      '/',
      //this.authMiddleware.verifyToken,
      //this.authMiddleware.hasRole(['ADMIN']),
      this.permissionsController.createPermission
    );

    this.router.put(
      '/:id',
      //this.authMiddleware.verifyToken,
      //this.authMiddleware.hasRole(['ADMIN']),
      this.permissionsController.updatePermission
    );

    this.router.delete(
      '/:id',
      //this.authMiddleware.verifyToken,
      //this.authMiddleware.hasRole(['ADMIN']),
      this.permissionsController.deletePermission
    );
  }

  public getRouter(): Router {
    return this.router;
  }
} 