import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, tap } from 'rxjs';
import { Catalogo } from '../models/catalogo';

@Injectable({
  providedIn: 'root'
})
export class CatalogosService {
  private readonly tiposDocumentoApiUrl = 'https://localhost:7225/api/tipos-documento';
  private readonly facultadesApiUrl = 'https://localhost:7225/api/facultades';
  private readonly tipoDocumentoCreadoSource = new Subject<Catalogo>();
  private readonly facultadCreadaSource = new Subject<Catalogo>();

  readonly tipoDocumentoCreado$ = this.tipoDocumentoCreadoSource.asObservable();
  readonly facultadCreada$ = this.facultadCreadaSource.asObservable();

  constructor(private readonly http: HttpClient) {}

  getTiposDocumento(): Observable<Catalogo[]> {
    return this.http.get<Catalogo[]>(this.tiposDocumentoApiUrl);
  }

  getFacultades(): Observable<Catalogo[]> {
    return this.http.get<Catalogo[]>(this.facultadesApiUrl);
  }

  crearTipoDocumento(descripcion: string): Observable<Catalogo> {
    return this.http
      .post<Catalogo>(this.tiposDocumentoApiUrl, { descripcion })
      .pipe(tap((tipoDocumento) => this.tipoDocumentoCreadoSource.next(tipoDocumento)));
  }

  crearFacultad(descripcion: string): Observable<Catalogo> {
    return this.http
      .post<Catalogo>(this.facultadesApiUrl, { descripcion })
      .pipe(tap((facultad) => this.facultadCreadaSource.next(facultad)));
  }
}
