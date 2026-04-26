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
}
