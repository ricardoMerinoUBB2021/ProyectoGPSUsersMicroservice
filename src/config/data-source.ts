import { DataSource, DataSourceOptions } from 'typeorm';
import { Usuario } from '../entities/user.entity';
import { Beneficiario } from '../entities/beneficiary.entity';
import { Rol } from '../entities/role.entity';
import { Permiso } from '../entities/permission.entity';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();

const isDevelopment = process.env.NODE_ENV === 'development';

// Define PostgreSQL configuration for production
const postgresConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  synchronize: false, // Turn off auto-synchronization to prevent schema conflicts
  logging: isDevelopment,
  entities: [Usuario, Beneficiario, Rol, Permiso],
  migrations: ['../migrations/**/*.ts'],
  subscribers: [],
  ssl: {
    rejectUnauthorized: false // Required for AWS RDS connections
  },
  extra: {
    // Additional connection options for better handling of unstable networks
    connectionTimeoutMillis: 10000, // 10 seconds
    query_timeout: 10000,
    statement_timeout: 10000
  }
};

// Use PostgreSQL for all environments
const AppDataSource = new DataSource(postgresConfig);

console.log(`Using ${AppDataSource.options.type} database for ${process.env.NODE_ENV} environment`);
console.log(`Connecting to database at ${process.env.DB_HOST}:${process.env.DB_PORT}`);

export default AppDataSource; 