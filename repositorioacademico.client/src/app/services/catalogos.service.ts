import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Catalogo } from '../models/catalogo';

@Injectable({
  providedIn: 'root'
})
export class CatalogosService {
  private readonly apiUrl = 'https://localhost:7225/api/catalogos';

  constructor(private readonly http: HttpClient) {}

  getTiposDocumento(): Observable<Catalogo[]> {
    return this.http.get<Catalogo[]>(`${this.apiUrl}/tipos-documento`);
  }

  getFacultades(): Observable<Catalogo[]> {
    return this.http.get<Catalogo[]>(`${this.apiUrl}/facultades`);
  }
}
