import { Request, Response } from 'express';
import { UserService } from '../services/user.service';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  // Get all users with pagination
  getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      
      const { users, total } = await this.userService.findAllUsers(page, limit);
      
      res.status(200).json({
        status: 'success',
        data: {
          users,
          pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error: any) {
      res.status(500).json({
        status: 'error',
        message: 'Error al obtener usuarios',
        error: error.message || 'Error desconocido'
      });
    }
  };

  // Get user by ID
  getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = parseInt(req.params.id, 10);
      const user = await this.userService.findUserById(userId);
      
      if (!user) {
        res.status(404).json({
          status: 'error',
          message: 'Usuario no encontrado'
        });
        return;
      }
      
      res.status(200).json({
        status: 'success',
        data: { user }
      });
    } catch (error: any) {
      res.status(500).json({
        status: 'error',
        message: 'Error al obtener usuario',
        error: error.message || 'Error desconocido'
      });
    }
  };

  // Create a new user
  createUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const newUser = await this.userService.createUser(req.body);
      
      res.status(201).json({
        status: 'success',
        message: 'Usuario creado exitosamente',
        data: { user: newUser }
      });
    } catch (error: any) {
      res.status(400).json({
        status: 'error',
        message: 'Error al crear usuario',
        error: error.message || 'Error desconocido'
      });
    }
  };

  // Update a user
  updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = parseInt(req.params.id, 10);
      const updatedUser = await this.userService.updateUser(userId, req.body);
      
      if (!updatedUser) {
        res.status(404).json({
          status: 'error',
          message: 'Usuario no encontrado'
        });
        return;
      }
      
      res.status(200).json({
        status: 'success',
        message: 'Usuario actualizado exitosamente',
        data: { user: updatedUser }
      });
    } catch (error: any) {
      res.status(400).json({
        status: 'error',
        message: 'Error al actualizar usuario',
        error: error.message || 'Error desconocido'
      });
    }
  };

  // Delete a user
  deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = parseInt(req.params.id, 10);
      const deleted = await this.userService.deleteUser(userId);
      
      if (!deleted) {
        res.status(404).json({
          status: 'error',
          message: 'Usuario no encontrado'
        });
        return;
      }
      
      res.status(200).json({
        status: 'success',
        message: 'Usuario eliminado exitosamente'
      });
    } catch (error: any) {
      res.status(500).json({
        status: 'error',
        message: 'Error al eliminar usuario',
        error: error.message || 'Error desconocido'
      });
    }
  };

  // Create a beneficiary
  createBeneficiary = async (req: Request, res: Response): Promise<void> => {
    try {
      // Split the request body into user and beneficiary data
      const { 
        // User data
        username, credentials,
        
        // Beneficiary data
        discountCategory, discount
      } = req.body;
      
      // Prepare user data
      const userData = { username, credentials };
      
      // Prepare beneficiary data
      const beneficiaryData = { discountCategory, discount };
      
      // Create both user and beneficiary in a transaction
      const newBeneficiary = await this.userService.createBeneficiary(userData, beneficiaryData);
      
      res.status(201).json({
        status: 'success',
        message: 'Beneficiario creado exitosamente',
        data: { beneficiary: newBeneficiary }
      });
    } catch (error: any) {
      res.status(400).json({
        status: 'error',
        message: 'Error al crear beneficiario',
        error: error.message || 'Error desconocido'
      });
    }
  };

  // Role management endpoints
  getAllRoles = async (req: Request, res: Response): Promise<void> => {
    try {
      const roles = await this.userService.getAllRoles();
      
      res.status(200).json({
        status: 'success',
        data: { roles }
      });
    } catch (error: any) {
      res.status(500).json({
        status: 'error',
        message: 'Error al obtener roles',
        error: error.message || 'Error desconocido'
      });
    }
  };

  createRole = async (req: Request, res: Response): Promise<void> => {
    try {
      const newRole = await this.userService.createRole(req.body);
      
      res.status(201).json({
        status: 'success',
        message: 'Rol creado exitosamente',
        data: { role: newRole }
      });
    } catch (error: any) {
      res.status(400).json({
        status: 'error',
        message: 'Error al crear rol',
        error: error.message || 'Error desconocido'
      });
    }
  };

  updateRole = async (req: Request, res: Response): Promise<void> => {
    try {
      const roleId = parseInt(req.params.id, 10);
      const updatedRole = await this.userService.updateRole(roleId, req.body);
      
      if (!updatedRole) {
        res.status(404).json({
          status: 'error',
          message: 'Rol no encontrado'
        });
        return;
      }
      
      res.status(200).json({
        status: 'success',
        message: 'Rol actualizado exitosamente',
        data: { role: updatedRole }
      });
    } catch (error: any) {
      res.status(400).json({
        status: 'error',
        message: 'Error al actualizar rol',
        error: error.message || 'Error desconocido'
      });
    }
  };

  deleteRole = async (req: Request, res: Response): Promise<void> => {
    try {
      const roleId = parseInt(req.params.id, 10);
      const deleted = await this.userService.deleteRole(roleId);
      
      if (!deleted) {
        res.status(404).json({
          status: 'error',
          message: 'Rol no encontrado'
        });
        return;
      }
      
      res.status(200).json({
        status: 'success',
        message: 'Rol eliminado exitosamente'
      });
    } catch (error: any) {
      res.status(500).json({
        status: 'error',
        message: 'Error al eliminar rol',
        error: error.message || 'Error desconocido'
      });
    }
  };

  // Permission management endpoints
  getAllPermissions = async (req: Request, res: Response): Promise<void> => {
    try {
      const permissions = await this.userService.getAllPermissions();
      
      res.status(200).json({
        status: 'success',
        data: { permissions }
      });
    } catch (error: any) {
      res.status(500).json({
        status: 'error',
        message: 'Error al obtener permisos',
        error: error.message || 'Error desconocido'
      });
    }
  };
} 