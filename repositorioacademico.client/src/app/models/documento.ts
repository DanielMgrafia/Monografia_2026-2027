export interface Documento {
  id: number;
  titulo?: string;
  autor?: string;
  tipoId?: string;
  facultadId?: string;
  rutaDocumento?: string;
  fechaSubida: Date;
  estado?: string;
  usuarioId: number;
}
