import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { ENV } from '../config/env';
import { CustomError } from '../types';

export const errorHandler = (err: CustomError, req: Request, res: Response, next: NextFunction) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Error interno del servidor';

  // Si no es un ApiError conocido, intentamos extraer el status si existe
  if (!(err instanceof ApiError)) {
    statusCode = err.statusCode || 500;
    message = err.message || 'Error interno del servidor';
  }

  // Log del error en desarrollo
  if (ENV.NODE_ENV === 'development') {
    console.error(`[Error] ${statusCode} - ${message}`);
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(ENV.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
