import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Permiso } from '../models/rol';

@Injectable({
  providedIn: 'root'
})
export class PermisosService {
  private readonly apiUrl = 'https://localhost:7225/api/permisos';

  constructor(private readonly http: HttpClient) {}

  getPermisos(): Observable<Permiso[]> {
    return this.http.get<Permiso[]>(this.apiUrl);
  }
}
