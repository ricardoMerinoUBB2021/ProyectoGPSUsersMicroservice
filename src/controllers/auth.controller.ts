import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  // User registration
  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const { username, credentials } = req.body;
      
      if (!username || !credentials) {
        res.status(400).json({
          status: 'error',
          message: 'Se requiere nombre de usuario y contraseña'
        });
        return;
      }
      
      const user = await this.authService.register({ username, credentials });
      
      res.status(201).json({
        status: 'success',
        message: 'Usuario registrado exitosamente',
        data: {
          user: {
            userId: user.userId,
            username: user.username
          }
        }
      });
    } catch (error: any) {
      res.status(500).json({
        status: 'error',
        message: 'Error al registrar usuario',
        error: error.message || 'Error desconocido'
      });
    }
  };

  // User login
  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { username, credentials } = req.body;
      
      if (!username || !credentials) {
        res.status(400).json({
          status: 'error',
          message: 'Se requiere nombre de usuario y contraseña'
        });
        return;
      }
      
      const result = await this.authService.login(username, credentials);
      
      if (!result) {
        res.status(401).json({
          status: 'error',
          message: 'Usuario o contraseña incorrectos'
        });
        return;
      }
      
      res.status(200).json({
        status: 'success',
        message: 'Inicio de sesión exitoso',
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        status: 'error',
        message: 'Error en el servidor',
        error: error.message || 'Error desconocido'
      });
    }
  };

  // Get current user profile
  getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      // User ID should be provided in the request body
      const { userId } = req.body;
      
      if (!userId) {
        res.status(400).json({
          status: 'error',
          message: 'Se requiere el ID de usuario'
        });
        return;
      }
      
      const profile = await this.authService.getUserProfile(userId);
      
      if (!profile) {
        res.status(404).json({
          status: 'error',
          message: 'Perfil no encontrado'
        });
        return;
      }
      
      res.status(200).json({
        status: 'success',
        data: { profile }
      });
    } catch (error: any) {
      res.status(500).json({
        status: 'error',
        message: 'Error al obtener perfil',
        error: error.message || 'Error desconocido'
      });
    }
  };

  // Change password
  changePassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId, currentPassword, newPassword } = req.body;
      
      if (!userId) {
        res.status(400).json({
          status: 'error',
          message: 'Se requiere el ID de usuario'
        });
        return;
      }
      
      if (!currentPassword || !newPassword) {
        res.status(400).json({
          status: 'error',
          message: 'Se requiere contraseña actual y nueva'
        });
        return;
      }
      
      const success = await this.authService.changePassword(
        userId,
        currentPassword,
        newPassword
      );
      
      if (!success) {
        res.status(401).json({
          status: 'error',
          message: 'Contraseña actual incorrecta'
        });
        return;
      }
      
      res.status(200).json({
        status: 'success',
        message: 'Contraseña actualizada exitosamente'
      });
    } catch (error: any) {
      res.status(500).json({
        status: 'error',
        message: 'Error al cambiar contraseña',
        error: error.message || 'Error desconocido'
      });
    }
  };
}