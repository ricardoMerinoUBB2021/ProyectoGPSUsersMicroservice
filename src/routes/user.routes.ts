import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { TipoUsuario } from '../entities/user.entity';

export class UserRoutes {
  private router: Router;
  private userController: UserController;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.router = Router();
    this.userController = new UserController();
    this.authMiddleware = new AuthMiddleware();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Regular user routes
    this.router.get(
      '/usuarios',
      //this.authMiddleware.verifyToken,
      this.userController.getAllUsers
    );

    this.router.get(
      '/usuarios/:id',
      //this.authMiddleware.verifyToken,
      this.userController.getUserById
    );

    this.router.post(
      '/usuarios',
      //this.authMiddleware.verifyToken,
      //this.authMiddleware.hasRole([TipoUsuario.ADMIN]),
      this.userController.createUser
    );

    this.router.put(
      '/usuarios/:id',
      //this.authMiddleware.verifyToken,
      //this.authMiddleware.hasRole([TipoUsuario.ADMIN]),
      this.userController.updateUser
    );

    this.router.delete(
      '/usuarios/:id',
      //this.authMiddleware.verifyToken,
      //this.authMiddleware.hasRole([TipoUsuario.ADMIN]),
      this.userController.deleteUser
    );

    // Beneficiary specific routes
    this.router.get(
      '/beneficiarios/:id/historial',
      //this.authMiddleware.verifyToken,
      this.userController.getBeneficiaryHistory
    );

    this.router.get(
      '/beneficiarios/:id/recetas',
      //this.authMiddleware.verifyToken,
      this.userController.getBeneficiaryPrescriptions
    );

    this.router.post(
      '/beneficiarios',
      //this.authMiddleware.verifyToken,
      this.userController.createBeneficiary
    );

    // Role management
    this.router.get(
      '/roles',
      //this.authMiddleware.verifyToken,
      this.userController.getAllRoles
    );

    this.router.post(
      '/roles',
      //this.authMiddleware.verifyToken,
      //this.authMiddleware.hasRole([TipoUsuario.ADMIN]),
      this.userController.createRole
    );

    this.router.put(
      '/roles/:id',
      //this.authMiddleware.verifyToken,
      //this.authMiddleware.hasRole([TipoUsuario.ADMIN]),
      this.userController.updateRole
    );

    this.router.delete(
      '/roles/:id',
      //this.authMiddleware.verifyToken,
      //this.authMiddleware.hasRole([TipoUsuario.ADMIN]),
      this.userController.deleteRole
    );

    // Permission management
    this.router.get(
      '/permisos',
      //this.authMiddleware.verifyToken,
      this.userController.getAllPermissions
    );
  }

  public getRouter(): Router {
    return this.router;
  }
} 