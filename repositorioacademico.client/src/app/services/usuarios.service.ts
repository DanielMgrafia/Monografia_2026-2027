import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario } from '../models/usuario';

export interface CrearUsuarioPayload {
  nombres: string;
  apellidos: string;
  correo: string;
  carnet: string;
  password: string;
  estado?: string;
  rolIds: number[];
}

export interface ActualizarRolesUsuarioPayload {
  rolIds: number[];
}

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private readonly apiUrl = 'https://localhost:7225/api/usuarios';

  constructor(private readonly http: HttpClient) {}

  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl);
  }

  crearUsuario(payload: CrearUsuarioPayload): Observable<Usuario> {
    return this.http.post<Usuario>(this.apiUrl, payload);
  }

  actualizarRoles(usuarioId: number, payload: ActualizarRolesUsuarioPayload): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/${usuarioId}/roles`, payload);
  }
}
