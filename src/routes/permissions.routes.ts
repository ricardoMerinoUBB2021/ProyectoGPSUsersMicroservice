import { Router } from 'express';
import { PermissionsController } from '../controllers/permissions.controller';

export class PermissionsRoutes {
  private router: Router;
  private permissionsController: PermissionsController;

  constructor() {
    this.router = Router();
    this.permissionsController = new PermissionsController();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Permission management routes
    this.router.get(
      '/',
      this.permissionsController.getAllPermissions
    );

    this.router.get(
      '/:id',
      this.permissionsController.getPermissionById
    );

    this.router.post(
      '/',
      this.permissionsController.createPermission
    );

    this.router.put(
      '/:id',
      this.permissionsController.updatePermission
    );

    this.router.delete(
      '/:id',
      this.permissionsController.deletePermission
    );
  }

  public getRouter(): Router {
    return this.router;
  }
} 