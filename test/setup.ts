// Test setup file for Jest
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set default test environment variables if not present
process.env.NODE_ENV = process.env.NODE_ENV || 'test';

// Database configuration with fallbacks for local testing
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_PORT = process.env.DB_PORT || '5432';
process.env.DB_USER = process.env.DB_USER || 'test_user';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'test_password';
process.env.DB_NAME = process.env.DB_NAME || 'test_db';

// JWT configuration with fallback for local testing
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key-for-local-testing-only';

// Application configuration
process.env.PORT = process.env.PORT || '3002';
process.env.LOG_LEVEL = process.env.LOG_LEVEL || 'error';

// Global test timeout
jest.setTimeout(30000);

// Suppress console logs during tests unless explicitly needed
if (process.env.NODE_ENV === 'test') {
  console.log = jest.fn();
  console.error = jest.fn();
  console.warn = jest.fn();
}

// Declare global types
declare global {
  var testUtils: {
    createMockUser: (overrides?: any) => any;
    createMockRole: (overrides?: any) => any;
    createMockPermission: (overrides?: any) => any;
    createMockBeneficiary: (overrides?: any) => any;
    createMockPerson: (overrides?: any) => any;
  };
}

// Global test utilities
global.testUtils = {
  // Helper to create mock user data
  createMockUser: (overrides = {}) => ({
    userId: 1,
    username: 'testuser',
    credentials: 'hashedPassword',
    salt: 'salt123',
    roles: [],
    beneficiary: null,
    ...overrides
  }),

  // Helper to create mock role data
  createMockRole: (overrides = {}) => ({
    roleId: 1,
    roleName: 'TEST_ROLE',
    description: 'Test role for testing',
    permissions: [],
    ...overrides
  }),

  // Helper to create mock permission data
  createMockPermission: (overrides = {}) => ({
    permissionsId: 1,
    permissionName: 'test:permission',
    description: 'Test permission',
    ...overrides
  }),

  // Helper to create mock beneficiary data
  createMockBeneficiary: (overrides = {}) => ({
    beneficiaryId: 1,
    discountCategory: 'GENERAL',
    discount: 0.1,
    user: null,
    ...overrides
  }),

  // Helper to create mock person data
  createMockPerson: (overrides = {}) => ({
    rut: '12345678-9',
    name: 'John',
    lastname: 'Doe',
    beneficiary: null,
    ...overrides
  })
};

// Clean up after all tests
afterAll(async () => {
  // Add any global cleanup here if needed
  jest.clearAllMocks();
});

// Log test environment info (without exposing secrets)
console.log('Test environment configured:');
console.log(`- NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`- DB_HOST: ${process.env.DB_HOST}`);
console.log(`- DB_PORT: ${process.env.DB_PORT}`);
console.log(`- DB_NAME: ${process.env.DB_NAME}`);
console.log(`- JWT_SECRET: ${process.env.JWT_SECRET ? '[SET]' : '[NOT SET]'}`); 