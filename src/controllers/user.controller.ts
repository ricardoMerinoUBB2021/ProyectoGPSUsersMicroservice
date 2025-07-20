import { Request, Response } from 'express';
import { UserService } from '../services/user.service';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  // Get all users
  getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const users = await this.userService.findAllUsers();
      
      res.status(200).json({
        status: 'success',
        data: { users }
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

  // Get all beneficiaries
  getAllBeneficiaries = async (req: Request, res: Response): Promise<void> => {
    try {
      const beneficiaries = await this.userService.getAllBeneficiaries();
      
      res.status(200).json({
        status: 'success',
        data: { beneficiaries }
      });
    } catch (error: any) {
      res.status(500).json({
        status: 'error',
        message: 'Error al obtener beneficiarios',
        error: error.message || 'Error desconocido'
      });
    }
  };

  // Get beneficiary by ID
  getBeneficiaryById = async (req: Request, res: Response): Promise<void> => {
    try {
      const beneficiaryId = parseInt(req.params.id, 10);
      const beneficiary = await this.userService.findBeneficiaryById(beneficiaryId);
      
      if (!beneficiary) {
        res.status(404).json({
          status: 'error',
          message: 'Beneficiario no encontrado'
        });
        return;
      }
      
      res.status(200).json({
        status: 'success',
        data: { beneficiary }
      });
    } catch (error: any) {
      res.status(500).json({
        status: 'error',
        message: 'Error al obtener beneficiario',
        error: error.message || 'Error desconocido'
      });
    }
  };

  // Update a beneficiary
  updateBeneficiary = async (req: Request, res: Response): Promise<void> => {
    try {
      const beneficiaryId = parseInt(req.params.id, 10);
      const updatedBeneficiary = await this.userService.updateBeneficiary(beneficiaryId, req.body);
      
      if (!updatedBeneficiary) {
        res.status(404).json({
          status: 'error',
          message: 'Beneficiario no encontrado'
        });
        return;
      }
      
      res.status(200).json({
        status: 'success',
        message: 'Beneficiario actualizado exitosamente',
        data: { beneficiary: updatedBeneficiary }
      });
    } catch (error: any) {
      res.status(400).json({
        status: 'error',
        message: 'Error al actualizar beneficiario',
        error: error.message || 'Error desconocido'
      });
    }
  };

  // Delete a beneficiary
  deleteBeneficiary = async (req: Request, res: Response): Promise<void> => {
    try {
      const beneficiaryId = parseInt(req.params.id, 10);
      const deleted = await this.userService.deleteBeneficiary(beneficiaryId);
      
      if (!deleted) {
        res.status(404).json({
          status: 'error',
          message: 'Beneficiario no encontrado'
        });
        return;
      }
      
      res.status(200).json({
        status: 'success',
        message: 'Beneficiario eliminado exitosamente'
      });
    } catch (error: any) {
      res.status(500).json({
        status: 'error',
        message: 'Error al eliminar beneficiario',
        error: error.message || 'Error desconocido'
      });
    }
  };
}; 