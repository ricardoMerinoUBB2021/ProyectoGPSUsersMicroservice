export const appConfig = {
  port: process.env.PORT || 3002,
  environment: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret',
  apiPrefix: '/api',
};