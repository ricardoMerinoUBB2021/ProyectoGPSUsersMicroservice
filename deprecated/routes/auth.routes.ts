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
    // Public routes for authentication (no JWT required)
    this.router.post('/login', this.authController.login);
    this.router.post('/register', this.authController.register);

    // Protected routes (require JWT verification)
    this.router.get('/perfil', 
      this.authMiddleware.verifyToken,
      this.authController.getProfile
    );
    this.router.post('/cambiar-clave', 
      this.authMiddleware.verifyToken,
      this.authController.changePassword
    );
  }

  public getRouter(): Router {
    return this.router;
  }
} 