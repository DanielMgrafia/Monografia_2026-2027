import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Documento } from '../models/documento';
import { FavoritoDocumentoResponse, HistorialBiblioteca } from '../models/biblioteca';

@Injectable({
  providedIn: 'root'
})
export class BibliotecaService {
  private readonly apiUrl = 'https://localhost:7225/api/biblioteca';

  constructor(private readonly http: HttpClient) {}

  registrarVista(documentoId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/documentos/${documentoId}/vista`, {});
  }

  alternarFavorito(documentoId: number): Observable<FavoritoDocumentoResponse> {
    return this.http.post<FavoritoDocumentoResponse>(`${this.apiUrl}/documentos/${documentoId}/favorito`, {});
  }

  getHistorial(): Observable<HistorialBiblioteca> {
    return this.http.get<HistorialBiblioteca>(`${this.apiUrl}/historial`);
  }

  getRecomendaciones(): Observable<Documento[]> {
    return this.http.get<Documento[]>(`${this.apiUrl}/recomendaciones`);
  }
}
