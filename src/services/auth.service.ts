import { Repository, Like, Equal } from 'typeorm';
import AppDataSource from '../config/data-source';
import { Usuario } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { SignOptions, Secret } from 'jsonwebtoken';

export class AuthService {
    private userRepository: Repository<Usuario>;
    private JWT_SECRET: Secret;
    private JWT_EXPIRATION: string;

    constructor() {
        this.userRepository = AppDataSource.getRepository(Usuario);
        this.JWT_SECRET = process.env.JWT_SECRET || 'default_secret_change_in_production';
        this.JWT_EXPIRATION = process.env.JWT_EXPIRATION || '1h';
    }

    public async register(userData: any): Promise<any> {
        // Logic for registering a new user
        // Validate user data, hash password, and save to database
    }

    async login(username: string, password: string): Promise<{ token: string, user: Partial<Usuario> } | null> {
        // Find user by username - using raw queries for JSON fields in SQLite
        // First get all active users
        const users = await this.userRepository.find({
            where: { 
                activo: true 
            }
        });
        
        // Then filter by username in credentials (can't directly query JSON in SQLite)
        const user = users.find(u => u.credenciales.username === username);

        if (!user) {
            return null;
        }

        // Check if user is blocked
        if (user.credenciales.bloqueado) {
            throw new Error('Usuario bloqueado. Contacte al administrador.');
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.credenciales.passwordHash);
        
        if (!isPasswordValid) {
            // Increment failed attempts
            user.credenciales.intentosFallidos = (user.credenciales.intentosFallidos || 0) + 1;
            
            // Block user after 5 failed attempts
            if (user.credenciales.intentosFallidos >= 5) {
                user.credenciales.bloqueado = true;
            }
            
            await this.userRepository.save(user);
            return null;
        }

        // Reset failed attempts and update last access
        user.credenciales.intentosFallidos = 0;
        user.credenciales.ultimoAcceso = new Date().toISOString();
        await this.userRepository.save(user);

        // Generate JWT token
        const payload = { 
            id: user.id,
            tipo: user.tipo,
            permisos: user.permisos
        };
        
        const options: SignOptions = { 
            expiresIn: Number(this.JWT_EXPIRATION) 
        };
        
        const token = jwt.sign(payload, this.JWT_SECRET, options);

        // Return user info without sensitive data
        const { credenciales, ...userWithoutCredentials } = user;
        
        return {
            token,
            user: userWithoutCredentials
        };
    }

    async validateToken(token: string): Promise<any> {
        try {
            const decoded = jwt.verify(token, this.JWT_SECRET);
            return decoded;
        } catch (error) {
            return null;
        }
    }

    async getUserProfile(userId: string): Promise<Partial<Usuario> | null> {
        const user = await this.userRepository.findOneBy({ id: userId });
        
        if (!user) {
            return null;
        }

        // Return user without sensitive data
        const { credenciales, ...userWithoutCredentials } = user;
        return userWithoutCredentials;
    }

    async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
        const user = await this.userRepository.findOneBy({ id: userId });
        
        if (!user) {
            return false;
        }

        // Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, user.credenciales.passwordHash);
        
        if (!isPasswordValid) {
            return false;
        }

        // Update password
        user.credenciales.passwordHash = await bcrypt.hash(newPassword, 10);
        await this.userRepository.save(user);
        
        return true;
    }

    // Check if a user has a specific permission
    hasPermission(userPermisos: string[], requiredPermission: string): boolean {
        return userPermisos.includes(requiredPermission);
    }

    // Additional methods for authentication-related logic can be added here
}