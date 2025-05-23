import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

async function initDatabase() {
  console.log('Initializing PostgreSQL database...');
  
  const pgConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'postgres',
    database: process.env.DB_NAME || 'users_microservice'
  };

  try {
    // Create a connection pool
    const pool = new Pool(pgConfig);
    
    // Check if tables already exist
    const tablesExist = await checkIfTablesExist(pool);
    
    if (tablesExist) {
      console.log('Database tables already exist. Skipping initialization.');
      await pool.end();
      return;
    }
    
    // Read the SQL initialization file
    const sqlFilePath = path.join(__dirname, '../config/init-database.sql');
    const sqlScript = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Execute the SQL script
    console.log('Executing SQL script...');
    await pool.query(sqlScript);
    
    console.log('Database initialization completed successfully.');
    
    // Close the connection pool
    await pool.end();
    
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

// Helper function to check if tables already exist
async function checkIfTablesExist(pool: Pool): Promise<boolean> {
  try {
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'usuarios'
      );
    `);
    
    return result.rows[0].exists;
  } catch (error) {
    console.error('Error checking if tables exist:', error);
    return false;
  }
}

// Execute the initialization function if this script is run directly
if (require.main === module) {
  initDatabase();
}

export default initDatabase; 