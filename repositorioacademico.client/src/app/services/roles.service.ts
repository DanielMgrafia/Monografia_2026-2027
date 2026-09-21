import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Rol } from '../models/rol';

export interface CrearRolPayload {
  nombre: string;
  descripcion?: string;
  estado?: string;
  permisoIds: number[];
}

export interface ActualizarRolPayload {
  nombre: string;
  descripcion?: string;
  estado?: string;
}

export interface ActualizarPermisosRolPayload {
  permisoIds: number[];
}

@Injectable({
  providedIn: 'root'
})
export class RolesService {
  private readonly apiUrl = 'https://localhost:7225/api/roles';

  constructor(private readonly http: HttpClient) {}

  getRoles(incluirInactivos = false): Observable<Rol[]> {
    const params = incluirInactivos ? { incluirInactivos: 'true' } : undefined;
    return this.http.get<Rol[]>(this.apiUrl, { params });
  }

  crearRol(payload: CrearRolPayload): Observable<Rol> {
    return this.http.post<Rol>(this.apiUrl, payload);
  }

  actualizarRol(rolId: number, payload: ActualizarRolPayload): Observable<Rol> {
    return this.http.put<Rol>(`${this.apiUrl}/${rolId}`, payload);
  }

  actualizarEstado(rolId: number, estado: string): Observable<Rol> {
    return this.http.put<Rol>(`${this.apiUrl}/${rolId}/estado`, { estado });
  }

  actualizarPermisos(rolId: number, payload: ActualizarPermisosRolPayload): Observable<Rol> {
    return this.http.put<Rol>(`${this.apiUrl}/${rolId}/permisos`, payload);
  }
}
