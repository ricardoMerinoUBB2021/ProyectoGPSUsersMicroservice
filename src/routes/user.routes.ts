import { Router } from 'express';
import { UserController } from '../controllers/user.controller';

export class UserRoutes {
  private router: Router;
  private userController: UserController;

  constructor() {
    this.router = Router();
    this.userController = new UserController();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Authentication routes (public)
    this.router.post(
      '/usuarios/login',
      this.userController.login
    );

    this.router.post(
      '/usuarios/register',
      this.userController.register
    );

    // Regular user routes
    this.router.get(
      '/usuarios',
      this.userController.getAllUsers
    );

    this.router.get(
      '/usuarios/:id',
      this.userController.getUserById
    );

    this.router.post(
      '/usuarios',
      this.userController.createUser
    );

    this.router.put(
      '/usuarios/:id',
      this.userController.updateUser
    );

    this.router.delete(
      '/usuarios/:id',
      this.userController.deleteUser
    );

    // Beneficiary specific routes
    this.router.post(
      '/beneficiarios',
      this.userController.createBeneficiary
    );

    this.router.get(
      '/beneficiarios',
      this.userController.getAllBeneficiaries
    );

    this.router.get(
      '/beneficiarios/:id',
      this.userController.getBeneficiaryById
    );

    this.router.put(
      '/beneficiarios/:id',
      this.userController.updateBeneficiary
    );

    this.router.delete(
      '/beneficiarios/:id',
      this.userController.deleteBeneficiary
    );
  }

  public getRouter(): Router {
    return this.router;
  }
} 