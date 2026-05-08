import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { BibliotecaService } from '../../services/biblioteca.service';
import { Catalogo } from '../../models/catalogo';
import { Documento } from '../../models/documento';
import { AuthService } from '../../services/auth.service';
import { CatalogosService } from '../../services/catalogos.service';
import { DocumentosService } from '../../services/documentos.service';

@Component({
  selector: 'app-lista-documentos',
  templateUrl: './lista-documentos.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  styleUrls: ['./lista-documentos.component.css']
})
export class ListaDocumentosComponent implements OnInit {
  documentos: Documento[] = [];
  recomendaciones: Documento[] = [];
  tiposDocumento: Catalogo[] = [];
  facultades: Catalogo[] = [];

  filtroTexto = '';
  filtroTipoDocumentoId: number | null = null;
  filtroFacultadId: number | null = null;
  filtroFechaDesde = '';
  filtroFechaHasta = '';

  cargando = false;
  favoritoCambiandoId: number | null = null;
  error = '';

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly bibliotecaService = inject(BibliotecaService);
  private readonly catalogosService = inject(CatalogosService);
  private readonly documentosService = inject(DocumentosService);

  get documentosFiltrados(): Documento[] {
    const filtroTexto = this.filtroTexto.trim().toLowerCase();
    const fechaDesde = this.filtroFechaDesde ? new Date(`${this.filtroFechaDesde}T00:00:00`) : null;
    const fechaHasta = this.filtroFechaHasta ? new Date(`${this.filtroFechaHasta}T23:59:59.999`) : null;

    return this.documentos
      .filter((documento) => (documento.estado ?? '') === 'Publicado')
      .filter((documento) => {
        if (filtroTexto) {
          const coincideTexto = [
            documento.titulo,
            documento.autor,
            documento.tipoDocumento,
            documento.facultad,
            documento.tutor,
            documento.descripcion,
            documento.palabrasClave
          ].some((valor) => valor?.toLowerCase().includes(filtroTexto));

          if (!coincideTexto) {
            return false;
          }
        }

        if (this.filtroTipoDocumentoId != null && documento.tipoDocumentoId !== this.filtroTipoDocumentoId) {
          return false;
        }

        if (this.filtroFacultadId != null && documento.facultadId !== this.filtroFacultadId) {
          return false;
        }

        const fechaDocumento = new Date(documento.fechaSubida);
        if (fechaDesde && fechaDocumento < fechaDesde) {
          return false;
        }

        if (fechaHasta && fechaDocumento > fechaHasta) {
          return false;
        }

        return true;
      })
      .sort((left, right) => new Date(right.fechaSubida).getTime() - new Date(left.fechaSubida).getTime());
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.filtroTexto = params.get('q') ?? '';
    });
    this.cargarPantalla();
  }

  cargarPantalla(): void {
    this.cargando = true;
    this.error = '';

    forkJoin({
      documentos: this.documentosService.getDocumentos(),
      recomendaciones: this.bibliotecaService.getRecomendaciones(),
      tiposDocumento: this.catalogosService.getTiposDocumento(),
      facultades: this.catalogosService.getFacultades()
    }).subscribe({
      next: ({ documentos, recomendaciones, tiposDocumento, facultades }) => {
        this.documentos = documentos;
        this.recomendaciones = recomendaciones;
        this.tiposDocumento = tiposDocumento;
        this.facultades = facultades;
        this.cargando = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar los documentos y catalogos del repositorio.';
        this.cargando = false;
      }
    });
  }

  limpiarFiltros(): void {
    this.filtroTexto = '';
    this.filtroTipoDocumentoId = null;
    this.filtroFacultadId = null;
    this.filtroFechaDesde = '';
    this.filtroFechaHasta = '';
  }

  abrirVisor(documento: Documento): void {
    const url = this.router.serializeUrl(
      this.router.createUrlTree(['/visor-documento', documento.id])
    );

    window.open(url, '_blank');
  }

  puedeDescargar(documento: Documento): boolean {
    return this.authService.hasPermission('DOCUMENTO.DESCARGAR') && documento.sePuedeDescargar !== false;
  }

  getDownloadStatusLabel(documento: Documento): string {
    if (documento.sePuedeDescargar === false) {
      return 'Solo visualizacion';
    }

    if (!this.authService.hasPermission('DOCUMENTO.DESCARGAR')) {
      return 'Tu rol no descarga';
    }

    return 'Descargable';
  }

  alternarFavorito(documento: Documento): void {
    this.favoritoCambiandoId = documento.id;
    this.error = '';

    this.bibliotecaService.alternarFavorito(documento.id).subscribe({
      next: (response) => {
        this.documentos = this.documentos.map((item) =>
          item.id === documento.id ? { ...item, esFavorito: response.esFavorito } : item
        );
        this.recomendaciones = this.recomendaciones.map((item) =>
          item.id === documento.id ? { ...item, esFavorito: response.esFavorito } : item
        );
        this.favoritoCambiandoId = null;
      },
      error: () => {
        this.error = 'No se pudo actualizar el favorito.';
        this.favoritoCambiandoId = null;
      }
    });
  }

  getFavoritoLabel(documento: Documento): string {
    if (this.favoritoCambiandoId === documento.id) {
      return 'Guardando...';
    }

    return documento.esFavorito ? 'Quitar favorito' : 'Guardar favorito';
  }
}
