export interface RolResumen {
  id: number;
  nombre: string;
  descripcion?: string | null;
  estado: string;
}

export interface Rol {
  id: number;
  nombre: string;
  descripcion?: string | null;
  estado: string;
  permisos: Permiso[];
}

export interface Permiso {
  id: number;
  codigo: string;
  descripcion: string;
  estado: string;
}
