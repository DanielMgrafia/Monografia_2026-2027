import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, Subject, tap } from 'rxjs';
import { Documento } from '../models/documento';

@Injectable({
  providedIn: 'root'
})
export class DocumentosService {
  private readonly apiUrl = 'https://localhost:7225/api/documentos';
  private readonly documentosActualizadosSource = new Subject<void>();

  readonly documentosActualizados$ = this.documentosActualizadosSource.asObservable();

  constructor(private readonly http: HttpClient) {}

  getDocumentos(): Observable<Documento[]> {
    return this.http.get<Documento[]>(this.apiUrl);
  }

  getDocumento(id: number): Observable<Documento> {
    return this.http.get<Documento>(`${this.apiUrl}/${id}`);
  }

  subirDocumento(formData: FormData): Observable<Documento> {
    return this.http
      .post<Documento>(`${this.apiUrl}/upload`, formData)
      .pipe(tap(() => this.documentosActualizadosSource.next()));
  }

  actualizarEstado(id: number, estado: string): Observable<Documento> {
    return this.http
      .put<Documento>(`${this.apiUrl}/${id}/estado`, { estado })
      .pipe(tap(() => this.documentosActualizadosSource.next()));
  }

  actualizarDocumento(id: number, documento: {
    titulo: string;
    autor: string;
    tipoDocumentoId: number;
    facultadId: number;
    estado: string;
    sePuedeDescargar: boolean;
  }): Observable<Documento> {
    return this.http
      .put<Documento>(`${this.apiUrl}/${id}`, documento)
      .pipe(tap(() => this.documentosActualizadosSource.next()));
  }

  actualizarDescarga(id: number, sePuedeDescargar: boolean): Observable<Documento> {
    return this.http
      .put<Documento>(`${this.apiUrl}/${id}/descarga`, { sePuedeDescargar })
      .pipe(tap(() => this.documentosActualizadosSource.next()));
  }

  visualizarDocumento(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/visualizar`, { responseType: 'blob' });
  }

  descargarDocumento(id: number): Observable<HttpResponse<Blob>> {
    return this.http.get(`${this.apiUrl}/${id}/descargar`, {
      observe: 'response',
      responseType: 'blob'
    });
  }

  buscar(
    titulo?: string,
    autor?: string,
    tipoDocumentoId?: number,
    facultadId?: number,
    estado?: string,
    fechaDesde?: string,
    fechaHasta?: string
  ): Observable<Documento[]> {
    const params: Record<string, string | number> = {};

    if (titulo) params['titulo'] = titulo;
    if (autor) params['autor'] = autor;
    if (tipoDocumentoId != null) params['tipoDocumentoId'] = tipoDocumentoId;
    if (facultadId != null) params['facultadId'] = facultadId;
    if (estado) params['estado'] = estado;
    if (fechaDesde) params['fechaDesde'] = fechaDesde;
    if (fechaHasta) params['fechaHasta'] = fechaHasta;

    return this.http.get<Documento[]>(`${this.apiUrl}/buscar`, { params });
  }
}
