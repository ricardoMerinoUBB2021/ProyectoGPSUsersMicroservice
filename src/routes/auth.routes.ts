import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { AuthMiddleware } from '../middlewares/auth.middleware';

export class AuthRoutes {
  private router: Router;
  private authController: AuthController;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.router = Router();
    this.authController = new AuthController();
    this.authMiddleware = new AuthMiddleware();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Public route for authentication
    this.router.post('/login', this.authController.login);

    // Public routes (no JWT verification)
    this.router.get('/perfil', this.authController.getProfile);
    this.router.post('/cambiar-clave', this.authController.changePassword);
  }

  public getRouter(): Router {
    return this.router;
  }
} 