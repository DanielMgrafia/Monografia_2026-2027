export interface Documento {
  id: number;
  titulo?: string;
  autor?: string;
  tipo?: string;
  categoria?: string;
  rutaDocumento?: string;
  fechaSubida: Date;
  estado?: string;
  usuarioId: number;
}
