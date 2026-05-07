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
  rutaDocumento?: string;
  fechaSubida: string | Date;
  estado?: string;
  sePuedeDescargar?: boolean;
  usuarioId: number;
  usuario?: UsuarioDocumento;
}
