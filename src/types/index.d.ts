import { Usuario } from '../entities/Usuario';

declare global {
  namespace Express {
    interface Request {
      user?: Usuario;
    }
  }
}

declare module 'express-session' {
  interface SessionData {
    usuarioId: number;
    rol: string;
  }
}

// Interfaz genérica para errores
export interface CustomError extends Error {
  statusCode?: number;
}
