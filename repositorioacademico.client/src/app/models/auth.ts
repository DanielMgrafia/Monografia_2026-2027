import { Usuario } from './usuario';

export interface LoginRequest {
  login: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  expiraEn: string;
  usuario: Usuario;
}
