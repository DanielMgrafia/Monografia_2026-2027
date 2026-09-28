import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfiguracionInstitucion } from '../models/configuracion-institucion';

export type GuardarConfiguracionInstitucionPayload = Omit<ConfiguracionInstitucion, 'id' | 'fechaActualizacion'>;

@Injectable({
  providedIn: 'root'
})
export class InstitucionService {
  private readonly apiUrl = 'https://localhost:7225/api/institucion';

  constructor(private readonly http: HttpClient) {}

  getConfiguracion(): Observable<ConfiguracionInstitucion> {
    return this.http.get<ConfiguracionInstitucion>(this.apiUrl);
  }

  guardarConfiguracion(payload: GuardarConfiguracionInstitucionPayload): Observable<ConfiguracionInstitucion> {
    return this.http.put<ConfiguracionInstitucion>(this.apiUrl, payload);
  }
}
