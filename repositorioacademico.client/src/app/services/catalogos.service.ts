import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, tap } from 'rxjs';
import { Catalogo } from '../models/catalogo';

@Injectable({
  providedIn: 'root'
})
export class CatalogosService {
  private readonly catalogosApiUrl = 'https://localhost:7225/api/catalogos';
  private readonly facultadesApiUrl = 'https://localhost:7225/api/facultades';
  private readonly facultadCreadaSource = new Subject<Catalogo>();

  readonly facultadCreada$ = this.facultadCreadaSource.asObservable();

  constructor(private readonly http: HttpClient) {}

  getTiposDocumento(): Observable<Catalogo[]> {
    return this.http.get<Catalogo[]>(`${this.catalogosApiUrl}/tipos-documento`);
  }

  getFacultades(): Observable<Catalogo[]> {
    return this.http.get<Catalogo[]>(this.facultadesApiUrl);
  }

  crearFacultad(descripcion: string): Observable<Catalogo> {
    return this.http
      .post<Catalogo>(this.facultadesApiUrl, { descripcion })
      .pipe(tap((facultad) => this.facultadCreadaSource.next(facultad)));
  }
}
