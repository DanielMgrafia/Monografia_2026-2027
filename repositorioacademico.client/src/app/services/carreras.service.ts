import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, tap } from 'rxjs';
import { ActualizarLineasCarreraPayload, Carrera, CrearCarreraPayload } from '../models/carrera';

@Injectable({
  providedIn: 'root'
})
export class CarrerasService {
  private readonly apiUrl = 'https://localhost:7225/api/carreras';
  private readonly carrerasActualizadasSource = new Subject<void>();

  readonly carrerasActualizadas$ = this.carrerasActualizadasSource.asObservable();

  constructor(private readonly http: HttpClient) {}

  getCarreras(incluirInactivas = false): Observable<Carrera[]> {
    const params = incluirInactivas ? { incluirInactivas: 'true' } : undefined;
    return this.http.get<Carrera[]>(this.apiUrl, { params });
  }

  crearCarrera(payload: CrearCarreraPayload): Observable<Carrera> {
    return this.http
      .post<Carrera>(this.apiUrl, payload)
      .pipe(tap(() => this.carrerasActualizadasSource.next()));
  }

  actualizarCarrera(carreraId: number, payload: CrearCarreraPayload): Observable<Carrera> {
    return this.http
      .put<Carrera>(`${this.apiUrl}/${carreraId}`, payload)
      .pipe(tap(() => this.carrerasActualizadasSource.next()));
  }

  actualizarEstadoCarrera(carreraId: number, estado: string): Observable<Carrera> {
    return this.http
      .put<Carrera>(`${this.apiUrl}/${carreraId}/estado`, { estado })
      .pipe(tap(() => this.carrerasActualizadasSource.next()));
  }

  actualizarLineasInvestigacion(
    carreraId: number,
    payload: ActualizarLineasCarreraPayload
  ): Observable<Carrera> {
    return this.http
      .put<Carrera>(`${this.apiUrl}/${carreraId}/lineas-investigacion`, payload)
      .pipe(tap(() => this.carrerasActualizadasSource.next()));
  }
}
