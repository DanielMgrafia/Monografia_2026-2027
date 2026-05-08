import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { DocumentoActividad, HistorialBiblioteca } from '../../models/biblioteca';
import { Documento } from '../../models/documento';
import { BibliotecaService } from '../../services/biblioteca.service';

@Component({
  selector: 'app-history-page',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './history-page.component.html',
  styleUrls: ['./history-page.component.css']
})
export class HistoryPageComponent implements OnInit {
  historial: HistorialBiblioteca = {
    descargas: [],
    vistos: [],
    favoritos: []
  };

  recomendaciones: Documento[] = [];
  cargando = false;
  error = '';

  private readonly router = inject(Router);
  private readonly bibliotecaService = inject(BibliotecaService);

  ngOnInit(): void {
    this.cargarPantalla();
  }

  cargarPantalla(): void {
    this.cargando = true;
    this.error = '';

    forkJoin({
      historial: this.bibliotecaService.getHistorial(),
      recomendaciones: this.bibliotecaService.getRecomendaciones()
    }).subscribe({
      next: ({ historial, recomendaciones }) => {
        this.historial = historial;
        this.recomendaciones = recomendaciones;
        this.cargando = false;
      },
      error: () => {
        this.error = 'No se pudo cargar tu historial de biblioteca.';
        this.cargando = false;
      }
    });
  }

  abrirDocumento(documento: Documento): void {
    const url = this.router.serializeUrl(
      this.router.createUrlTree(['/visor-documento', documento.id])
    );

    window.open(url, '_blank');
  }

  tieneContenido(): boolean {
    return this.historial.descargas.length > 0 ||
      this.historial.vistos.length > 0 ||
      this.historial.favoritos.length > 0;
  }

  getActividadVacia(actividades: DocumentoActividad[]): boolean {
    return actividades.length === 0;
  }
}
