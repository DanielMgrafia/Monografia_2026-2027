import { Documento } from './documento';

export interface DocumentoActividad {
  documento: Documento;
  fechaActividad: string | Date;
}

export interface HistorialBiblioteca {
  descargas: DocumentoActividad[];
  vistos: DocumentoActividad[];
  favoritos: DocumentoActividad[];
}

export interface FavoritoDocumentoResponse {
  documentoId: number;
  esFavorito: boolean;
  fechaMarcado?: string | Date | null;
}
