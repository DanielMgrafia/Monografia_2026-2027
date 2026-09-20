import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, tap } from 'rxjs';
import { Catalogo } from '../models/catalogo';
import { CrearSublineaInvestigacionPayload, SublineaInvestigacion } from '../models/sublinea-investigacion';

@Injectable({
  providedIn: 'root'
})
export class CatalogosService {
  private readonly tiposDocumentoApiUrl = 'https://localhost:7225/api/tipos-documento';
  private readonly facultadesApiUrl = 'https://localhost:7225/api/facultades';
  private readonly areasConocimientoApiUrl = 'https://localhost:7225/api/areas-conocimiento';
  private readonly lineasInvestigacionApiUrl = 'https://localhost:7225/api/lineas-investigacion';
  private readonly sublineasInvestigacionApiUrl = 'https://localhost:7225/api/sublineas-investigacion';
  private readonly tipoDocumentoCreadoSource = new Subject<Catalogo>();
  private readonly facultadCreadaSource = new Subject<Catalogo>();
  private readonly areaConocimientoCreadaSource = new Subject<Catalogo>();
  private readonly lineaInvestigacionCreadaSource = new Subject<Catalogo>();
  private readonly sublineaInvestigacionCreadaSource = new Subject<SublineaInvestigacion>();

  readonly tipoDocumentoCreado$ = this.tipoDocumentoCreadoSource.asObservable();
  readonly facultadCreada$ = this.facultadCreadaSource.asObservable();
  readonly areaConocimientoCreada$ = this.areaConocimientoCreadaSource.asObservable();
  readonly lineaInvestigacionCreada$ = this.lineaInvestigacionCreadaSource.asObservable();
  readonly sublineaInvestigacionCreada$ = this.sublineaInvestigacionCreadaSource.asObservable();

  constructor(private readonly http: HttpClient) {}

  getTiposDocumento(): Observable<Catalogo[]> {
    return this.http.get<Catalogo[]>(this.tiposDocumentoApiUrl);
  }

  getFacultades(): Observable<Catalogo[]> {
    return this.http.get<Catalogo[]>(this.facultadesApiUrl);
  }

  getAreasConocimiento(): Observable<Catalogo[]> {
    return this.http.get<Catalogo[]>(this.areasConocimientoApiUrl);
  }

  getLineasInvestigacion(): Observable<Catalogo[]> {
    return this.http.get<Catalogo[]>(this.lineasInvestigacionApiUrl);
  }

  getSublineasInvestigacion(): Observable<SublineaInvestigacion[]> {
    return this.http.get<SublineaInvestigacion[]>(this.sublineasInvestigacionApiUrl);
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

  crearAreaConocimiento(descripcion: string): Observable<Catalogo> {
    return this.http
      .post<Catalogo>(this.areasConocimientoApiUrl, { descripcion })
      .pipe(tap((areaConocimiento) => this.areaConocimientoCreadaSource.next(areaConocimiento)));
  }

  crearLineaInvestigacion(descripcion: string): Observable<Catalogo> {
    return this.http
      .post<Catalogo>(this.lineasInvestigacionApiUrl, { descripcion })
      .pipe(tap((lineaInvestigacion) => this.lineaInvestigacionCreadaSource.next(lineaInvestigacion)));
  }

  crearSublineaInvestigacion(payload: CrearSublineaInvestigacionPayload): Observable<SublineaInvestigacion> {
    return this.http
      .post<SublineaInvestigacion>(this.sublineasInvestigacionApiUrl, payload)
      .pipe(tap((sublineaInvestigacion) => this.sublineaInvestigacionCreadaSource.next(sublineaInvestigacion)));
  }
}
