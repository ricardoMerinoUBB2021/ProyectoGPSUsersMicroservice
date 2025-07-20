import { Router } from 'express';
import { RolesController } from '../controllers/roles.controller';
import { AuthMiddleware } from '../middlewares/auth.middleware';

export class RolesRoutes {
  private router: Router;
  private rolesController: RolesController;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.router = Router();
    this.rolesController = new RolesController();
    this.authMiddleware = new AuthMiddleware();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Role management routes
    this.router.get(
      '/',
      //this.authMiddleware.verifyToken,
      this.rolesController.getRoles
    );

    this.router.get(
      '/:id',
      //this.authMiddleware.verifyToken,
      this.rolesController.getRoleById
    );

    this.router.post(
      '/',
      //this.authMiddleware.verifyToken,
      //this.authMiddleware.hasRole(['ADMIN']),
      this.rolesController.createRole
    );

    this.router.put(
      '/:id',
      //this.authMiddleware.verifyToken,
      //this.authMiddleware.hasRole(['ADMIN']),
      this.rolesController.updateRole
    );

    this.router.delete(
      '/:id',
      //this.authMiddleware.verifyToken,
      //this.authMiddleware.hasRole(['ADMIN']),
      this.rolesController.deleteRole
    );
  }

  public getRouter(): Router {
    return this.router;
  }
} 