import { Repository } from 'typeorm';
import AppDataSource from '../config/data-source';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';

export class AuthService {
    private userRepository: Repository<User>;

    constructor() {
        this.userRepository = AppDataSource.getRepository(User);
    }

    public async register(userData: any): Promise<any> {
        // Logic for registering a new user
        // Validate user data, hash password, and save to database
    }

    async login(username: string, password: string): Promise<{ user: Partial<User> } | null> {
        // Find user by username
        const user = await this.userRepository.findOne({
            where: { username },
            relations: ['roles', 'beneficiary']
        });

        if (!user) {
            return null;
        }

        // Verify password using salt
        const isPasswordValid = await bcrypt.compare(password + user.salt, user.credentials);
        
        if (!isPasswordValid) {
            return null;
        }

        // Return user info without sensitive data
        const { credentials, salt, ...userWithoutCredentials } = user;
        
        return {
            user: userWithoutCredentials
        };
    }

    async getUserProfile(userId: number): Promise<Partial<User> | null> {
        const user = await this.userRepository.findOne({
            where: { userId },
            relations: ['roles', 'beneficiary']
        });
        
        if (!user) {
            return null;
        }

        // Return user without sensitive data
        const { credentials, salt, ...userWithoutCredentials } = user;
        return userWithoutCredentials;
    }

    async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<boolean> {
        const user = await this.userRepository.findOneBy({ userId });
        
        if (!user) {
            return false;
        }

        // Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword + user.salt, user.credentials);
        
        if (!isPasswordValid) {
            return false;
        }

        // Generate new salt and hash new password
        const newSalt = await bcrypt.genSalt(10);
        const newHashedPassword = await bcrypt.hash(newPassword + newSalt, 10);
        
        // Update password and salt
        user.credentials = newHashedPassword;
        user.salt = newSalt;
        await this.userRepository.save(user);
        
        return true;
    }

    // Check if a user has a specific permission through roles
    hasPermission(user: User, requiredPermission: string): boolean {
        if (!user.roles) return false;
        
        return user.roles.some(role => 
            role.permissions?.some(permission => 
                permission.permissionName === requiredPermission
            )
        );
    }

    // Additional methods for authentication-related logic can be added here
}