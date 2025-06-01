module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testPathIgnorePatterns: ['/node_modules/', '/dist/'],
    coveragePathIgnorePatterns: ['/node_modules/', '/dist/'],
    moduleFileExtensions: ['ts', 'js', 'json', 'node'],
    roots: ['<rootDir>/src', '<rootDir>/test'],
  };