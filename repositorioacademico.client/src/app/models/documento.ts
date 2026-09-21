export interface UsuarioDocumento {
  id: number;
  nombres: string;
  apellidos: string;
  correo: string;
}

export interface Documento {
  id: number;
  titulo?: string;
  autor?: string;
  tipoDocumentoId: number;
  tipoDocumento?: string;
  facultadId: number;
  facultad?: string;
  carreraId?: number | null;
  carrera?: string;
  lineaInvestigacionId?: number | null;
  lineaInvestigacion?: string;
  sublineaInvestigacionId?: number | null;
  sublineaInvestigacion?: string;
  rutaDocumento?: string;
  tutor?: string;
  anioPublicacion?: number | null;
  descripcion?: string;
  palabrasClave?: string;
  fechaSubida: string | Date;
  estado?: string;
  sePuedeDescargar?: boolean;
  usuarioId: number;
  usuario?: UsuarioDocumento;
  esFavorito?: boolean;
}
