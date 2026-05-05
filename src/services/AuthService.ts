import { UsuarioService } from './UsuarioService';
import { ApiError } from '../utils/ApiError';
import bcrypt from 'bcryptjs';

export class AuthService {
  static async login(usuarioNombre: string, password: string) {
    const usuario = await UsuarioService.getByUsername(usuarioNombre);

    if (!usuario) {
      throw new ApiError(401, 'Usuario o contraseña incorrectos');
    }

    const passwordValido = await bcrypt.compare(password, usuario.password);

    if (!passwordValido) {
      throw new ApiError(401, 'Usuario o contraseña incorrectos');
    }

    const { password: _, ...usuarioSinPassword } = usuario;
    return usuarioSinPassword;
  }
}
