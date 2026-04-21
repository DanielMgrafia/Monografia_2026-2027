import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Documento } from '../models/documento';

@Injectable({
  providedIn: 'root'
})
export class DocumentosService {

  private apiUrl = 'https://localhost:7225/api/documentos'; // ajusta el puerto

  constructor(private http: HttpClient) { }

  // LISTAR
  getDocumentos(): Observable<Documento[]> {
    return this.http.get<Documento[]>(this.apiUrl);
  }

  // OBTENER UNO
  getDocumento(id: number): Observable<Documento> {
    return this.http.get<Documento>(`${this.apiUrl}/${id}`);
  }

  // SUBIR ARCHIVO + DATA
  subirDocumento(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/upload`, formData);
  }

  // BUSCAR
  buscar(titulo?: string, autor?: string, categoria?: string): Observable<Documento[]> {
    let params: any = {};

    if (titulo) params.titulo = titulo;
    if (autor) params.autor = autor;
    if (categoria) params.categoria = categoria;

    return this.http.get<Documento[]>(`${this.apiUrl}/buscar`, { params });
  }

  // URL PARA VER PDF
  getArchivoUrl(nombre: string): string {
    return `${this.apiUrl}/archivo/${nombre}`;
  }
}
