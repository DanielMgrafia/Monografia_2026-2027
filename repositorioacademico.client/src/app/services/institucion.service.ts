import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ConfiguracionInstitucion } from '../models/configuracion-institucion';
import { BrandingService } from './branding.service';

export type GuardarConfiguracionInstitucionPayload = Omit<ConfiguracionInstitucion, 'id' | 'fechaActualizacion'>;

@Injectable({
  providedIn: 'root'
})
export class InstitucionService {
  private readonly apiUrl = 'https://localhost:7225/api/institucion';

  constructor(
    private readonly http: HttpClient,
    private readonly brandingService: BrandingService
  ) {}

  getConfiguracion(): Observable<ConfiguracionInstitucion> {
    return this.http.get<ConfiguracionInstitucion>(this.apiUrl).pipe(
      tap((configuracion) => this.brandingService.aplicarConfiguracion(configuracion))
    );
  }

  guardarConfiguracion(payload: GuardarConfiguracionInstitucionPayload): Observable<ConfiguracionInstitucion> {
    return this.http.put<ConfiguracionInstitucion>(this.apiUrl, payload).pipe(
      tap((configuracion) => this.brandingService.aplicarConfiguracion(configuracion))
    );
  }
}
