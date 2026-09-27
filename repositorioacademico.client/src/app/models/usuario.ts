import { RolResumen } from './rol';

export interface Usuario {
  id: number;
  nombres: string;
  apellidos: string;
  correo: string;
  carnet: string;
  estado: string;
  debeCambiarPassword: boolean;
  fechaCambioPassword?: string | null;
  passwordTemporalExpiraEn?: string | null;
  fechaCreacion: string;
  roles: RolResumen[];
  permisos: string[];
}
