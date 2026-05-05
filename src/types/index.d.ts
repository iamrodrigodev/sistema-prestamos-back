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
