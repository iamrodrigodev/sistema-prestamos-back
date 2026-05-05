import 'reflect-metadata';
import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import cors from 'cors';
import session from 'express-session';
import flash from 'connect-flash';
import { AppDataSource } from './config/data-source';
import { errorHandler } from './middleware/errorHandler';
import routes from './routes';
import { UsuarioService } from './services/UsuarioService';
import { seedDatabase } from './config/seed';

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configuración de Sesiones
app.use(session({
  secret: process.env.SESSION_SECRET || 'mi_secreto_seguro',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 // 1 día
  }
}));

app.use(flash());

// Configuración de Motor de Plantillas (EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'templates'));

// Middleware para poblar req.user desde la sesión
app.use(async (req, res, next) => {
  if (req.session && req.session.usuarioId) {
    try {
      const usuario = await UsuarioService.getById(req.session.usuarioId);
      (req as any).user = usuario;
    } catch (error) {
      delete req.session.usuarioId;
    }
  }
  next();
});

app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));
app.use('/api', routes);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

AppDataSource.initialize()
  .then(async () => {
    await seedDatabase();
    app.listen(PORT);
  })

export default app;
