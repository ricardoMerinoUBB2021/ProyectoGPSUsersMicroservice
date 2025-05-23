const { Client } = require('pg');
require('dotenv').config();

async function testConnection() {
  console.log('Testing connection to AWS RDS PostgreSQL...');
  console.log(`Connecting to ${process.env.DB_HOST} on port ${process.env.DB_PORT}`);
  
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    ssl: {
      rejectUnauthorized: false
    },
    connectionTimeoutMillis: 10000
  });

  try {
    await client.connect();
    console.log('Connection successful!');
    
    const result = await client.query('SELECT NOW() as time');
    console.log('Database time:', result.rows[0].time);
    
    await client.end();
    console.log('Connection closed.');
    return true;
  } catch (error) {
    console.error('Connection failed:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    return false;
  }
}

// Run the test
testConnection()
  .then(success => {
    if (!success) {
      console.log('\nTroubleshooting tips:');
      console.log('1. Check AWS RDS security group inbound rules');
      console.log('2. Verify your database credentials');
      console.log('3. Ensure PostgreSQL is listening on port 5432');
      console.log('4. Try connecting with other tools like psql or DBeaver');
      process.exit(1);
    }
  }); 