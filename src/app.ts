import express, { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import cors from 'cors';
import { json } from 'body-parser';
import "reflect-metadata";
import { UserRoutes } from './routes/user.routes';
import { RolesRoutes } from './routes/roles.routes';
import { PermissionsRoutes } from './routes/permissions.routes';

const app = express();

// Middleware
app.use(json());
app.use(cors());

// Initialize routes
const userRoutes = new UserRoutes();
const rolesRoutes = new RolesRoutes();
const permissionsRoutes = new PermissionsRoutes();

// Register routes
app.use('/api', userRoutes.getRouter());
app.use('/api/roles', rolesRoutes.getRouter());
app.use('/api/permissions', permissionsRoutes.getRouter());

// Handle 404 errors
app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    message: 'Ruta no encontrada'
  });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

export default app;