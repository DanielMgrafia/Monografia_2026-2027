import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, tap } from 'rxjs';
import { Catalogo } from '../models/catalogo';
import { CrearSublineaInvestigacionPayload, SublineaInvestigacion } from '../models/sublinea-investigacion';

export interface ActualizarCatalogoPayload {
  descripcion: string;
  estado?: string;
}

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

  getTiposDocumento(incluirInactivos = false): Observable<Catalogo[]> {
    return this.http.get<Catalogo[]>(this.tiposDocumentoApiUrl, {
      params: this.buildCatalogParams(incluirInactivos)
    });
  }

  getFacultades(incluirInactivos = false): Observable<Catalogo[]> {
    return this.http.get<Catalogo[]>(this.facultadesApiUrl, {
      params: this.buildCatalogParams(incluirInactivos)
    });
  }

  getAreasConocimiento(incluirInactivos = false): Observable<Catalogo[]> {
    return this.http.get<Catalogo[]>(this.areasConocimientoApiUrl, {
      params: this.buildCatalogParams(incluirInactivos)
    });
  }

  getLineasInvestigacion(incluirInactivos = false): Observable<Catalogo[]> {
    return this.http.get<Catalogo[]>(this.lineasInvestigacionApiUrl, {
      params: this.buildCatalogParams(incluirInactivos)
    });
  }

  getSublineasInvestigacion(incluirInactivos = false): Observable<SublineaInvestigacion[]> {
    return this.http.get<SublineaInvestigacion[]>(this.sublineasInvestigacionApiUrl, {
      params: this.buildCatalogParams(incluirInactivos)
    });
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

  actualizarTipoDocumento(id: number, payload: ActualizarCatalogoPayload): Observable<Catalogo> {
    return this.http.put<Catalogo>(`${this.tiposDocumentoApiUrl}/${id}`, payload);
  }

  actualizarEstadoTipoDocumento(id: number, estado: string): Observable<Catalogo> {
    return this.http.put<Catalogo>(`${this.tiposDocumentoApiUrl}/${id}/estado`, { estado });
  }

  actualizarFacultad(id: number, payload: ActualizarCatalogoPayload): Observable<Catalogo> {
    return this.http.put<Catalogo>(`${this.facultadesApiUrl}/${id}`, payload);
  }

  actualizarEstadoFacultad(id: number, estado: string): Observable<Catalogo> {
    return this.http.put<Catalogo>(`${this.facultadesApiUrl}/${id}/estado`, { estado });
  }

  actualizarAreaConocimiento(id: number, payload: ActualizarCatalogoPayload): Observable<Catalogo> {
    return this.http.put<Catalogo>(`${this.areasConocimientoApiUrl}/${id}`, payload);
  }

  actualizarEstadoAreaConocimiento(id: number, estado: string): Observable<Catalogo> {
    return this.http.put<Catalogo>(`${this.areasConocimientoApiUrl}/${id}/estado`, { estado });
  }

  actualizarLineaInvestigacion(id: number, payload: ActualizarCatalogoPayload): Observable<Catalogo> {
    return this.http.put<Catalogo>(`${this.lineasInvestigacionApiUrl}/${id}`, payload);
  }

  actualizarEstadoLineaInvestigacion(id: number, estado: string): Observable<Catalogo> {
    return this.http.put<Catalogo>(`${this.lineasInvestigacionApiUrl}/${id}/estado`, { estado });
  }

  actualizarSublineaInvestigacion(
    id: number,
    payload: CrearSublineaInvestigacionPayload
  ): Observable<SublineaInvestigacion> {
    return this.http.put<SublineaInvestigacion>(`${this.sublineasInvestigacionApiUrl}/${id}`, payload);
  }

  actualizarEstadoSublineaInvestigacion(id: number, estado: string): Observable<SublineaInvestigacion> {
    return this.http.put<SublineaInvestigacion>(`${this.sublineasInvestigacionApiUrl}/${id}/estado`, { estado });
  }

  private buildCatalogParams(incluirInactivos: boolean): Record<string, string> | undefined {
    return incluirInactivos ? { incluirInactivos: 'true' } : undefined;
  }
}
