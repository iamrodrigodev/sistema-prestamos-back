import 'reflect-metadata';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import session from 'express-session';
import flash from 'connect-flash';
import { errorHandler } from './middleware/errorHandler';
import routes from './routes';
import { UsuarioService } from './services/UsuarioService';
import { ENV, CONSTANTS } from './config/env';

const app = express();

// Middlewares Básicos
app.use(cors({
  origin: ENV.CORS_ORIGIN,
  credentials: true
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configuración de Sesiones
app.use(session({
  secret: ENV.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: ENV.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: CONSTANTS.SESSION_MAX_AGE
  }
}));

app.use(flash());

// Configuración de Motor de Plantillas (EJS)
app.set('view engine', 'ejs');
app.set('views', ENV.PATHS.TEMPLATES);

// Middleware para poblar req.user desde la sesión
app.use(async (req: Request, res: Response, next: NextFunction) => {
  if (req.session && req.session.usuarioId) {
    try {
      const usuario = await UsuarioService.getById(req.session.usuarioId);
      req.user = usuario;
    } catch (error) {
      delete req.session.usuarioId;
    }
  }
  next();
});

// Rutas Estáticas
app.use('/uploads', express.static(ENV.PATHS.UPLOADS));

// Rutas de la API
app.use('/api', routes);

// Manejo Global de Errores
app.use(errorHandler);

export default app;
