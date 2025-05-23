import express, { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import cors from 'cors';
import { json } from 'body-parser';
import "reflect-metadata";
import { UserRoutes } from './routes/user.routes';
import { AuthRoutes } from './routes/auth.routes';

const app = express();

// Middleware
app.use(json());
app.use(cors());

// Initialize routes
const userRoutes = new UserRoutes();
const authRoutes = new AuthRoutes();

// Register routes
app.use('/api/auth', authRoutes.getRouter());
app.use('/api', userRoutes.getRouter());

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