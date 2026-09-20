import { Catalogo } from './catalogo';

export interface Carrera {
  id: number;
  descripcion: string;
  estado?: string;
  facultadId: number;
  facultad?: string;
  areaConocimientoId: number;
  areaConocimiento?: string;
  lineasInvestigacion: Catalogo[];
}

export interface CrearCarreraPayload {
  descripcion: string;
  facultadId: number;
  areaConocimientoId: number;
  estado?: string;
}

export interface ActualizarLineasCarreraPayload {
  lineaInvestigacionIds: number[];
}
