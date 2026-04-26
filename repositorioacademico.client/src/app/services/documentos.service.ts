import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Documento } from '../models/documento';

@Injectable({
  providedIn: 'root'
})
export class DocumentosService {
  private readonly apiUrl = 'https://localhost:7225/api/documentos';

  constructor(private readonly http: HttpClient) {}

  getDocumentos(): Observable<Documento[]> {
    return this.http.get<Documento[]>(this.apiUrl);
  }

  getDocumento(id: number): Observable<Documento> {
    return this.http.get<Documento>(`${this.apiUrl}/${id}`);
  }

  subirDocumento(formData: FormData): Observable<Documento> {
    return this.http.post<Documento>(`${this.apiUrl}/upload`, formData);
  }

  actualizarEstado(id: number, estado: string): Observable<Documento> {
    return this.http.put<Documento>(`${this.apiUrl}/${id}/estado`, { estado });
  }

  actualizarDescarga(id: number, sePuedeDescargar: boolean): Observable<Documento> {
    return this.http.put<Documento>(`${this.apiUrl}/${id}/descarga`, { sePuedeDescargar });
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
    facultadId?: number
  ): Observable<Documento[]> {
    const params: Record<string, string | number> = {};

    if (titulo) params['titulo'] = titulo;
    if (autor) params['autor'] = autor;
    if (tipoDocumentoId != null) params['tipoDocumentoId'] = tipoDocumentoId;
    if (facultadId != null) params['facultadId'] = facultadId;

    return this.http.get<Documento[]>(`${this.apiUrl}/buscar`, { params });
  }
}
