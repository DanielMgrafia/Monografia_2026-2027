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

export interface ActualizarPermisosRolPayload {
  permisoIds: number[];
}

@Injectable({
  providedIn: 'root'
})
export class RolesService {
  private readonly apiUrl = 'https://localhost:7225/api/roles';

  constructor(private readonly http: HttpClient) {}

  getRoles(): Observable<Rol[]> {
    return this.http.get<Rol[]>(this.apiUrl);
  }

  crearRol(payload: CrearRolPayload): Observable<Rol> {
    return this.http.post<Rol>(this.apiUrl, payload);
  }

  actualizarPermisos(rolId: number, payload: ActualizarPermisosRolPayload): Observable<Rol> {
    return this.http.put<Rol>(`${this.apiUrl}/${rolId}/permisos`, payload);
  }
}
