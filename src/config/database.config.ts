import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
import { Beneficiary } from '../entities/beneficiary.entity';

// Load environment variables
config();

// Validate environment variables
const requiredEnvVars = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASS', 'DB_NAME'];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
    }
}

const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    synchronize: false,
    logging: true,
    entities: [User, Role, Permission, Beneficiary],
    migrations: ['src/migrations/**/*.ts'],
    ssl: {
        rejectUnauthorized: false
    },
    extra: {
        connectionTimeoutMillis: 10000,
        query_timeout: 10000,
        statement_timeout: 10000
    }
});

export default AppDataSource;