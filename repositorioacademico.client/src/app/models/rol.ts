export type RolFlag = 'esEstudiante' | 'esDocente' | 'esAdministrador' | 'esCargoAcademico';

export interface RolResumen {
  id: number;
  nombre: string;
  descripcion?: string | null;
  iconoUrl?: string | null;
  estado: string;
  esEstudiante: boolean;
  esDocente: boolean;
  esAdministrador: boolean;
  esCargoAcademico: boolean;
}

export interface Rol {
  id: number;
  nombre: string;
  descripcion?: string | null;
  iconoUrl?: string | null;
  estado: string;
  esEstudiante: boolean;
  esDocente: boolean;
  esAdministrador: boolean;
  esCargoAcademico: boolean;
  permisos: Permiso[];
}

export interface Permiso {
  id: number;
  codigo: string;
  descripcion: string;
  estado: string;
}
