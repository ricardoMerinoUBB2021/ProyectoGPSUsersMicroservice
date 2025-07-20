import { Router } from 'express';
import { RolesController } from '../controllers/roles.controller';

export class RolesRoutes {
  private router: Router;
  private rolesController: RolesController;

  constructor() {
    this.router = Router();
    this.rolesController = new RolesController();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Role management routes
    this.router.get(
      '/',
      this.rolesController.getRoles
    );

    this.router.get(
      '/:id',
      this.rolesController.getRoleById
    );

    this.router.post(
      '/',
      this.rolesController.createRole
    );

    this.router.put(
      '/:id',
      this.rolesController.updateRole
    );

    this.router.delete(
      '/:id',
      this.rolesController.deleteRole
    );
  }

  public getRouter(): Router {
    return this.router;
  }
} 