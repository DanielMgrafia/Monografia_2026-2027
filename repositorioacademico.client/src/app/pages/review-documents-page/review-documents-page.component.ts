import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Catalogo } from '../../models/catalogo';
import { Documento } from '../../models/documento';
import { CatalogosService } from '../../services/catalogos.service';
import { DocumentosService } from '../../services/documentos.service';

type EstadoDocumento = 'Pendiente' | 'Publicado' | 'Rechazado';

@Component({
  selector: 'app-review-documents-page',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './review-documents-page.component.html',
  styleUrls: ['./review-documents-page.component.css']
})
export class ReviewDocumentsPageComponent implements OnInit {
  documentos: Documento[] = [];
  tiposDocumento: Catalogo[] = [];
  facultades: Catalogo[] = [];

  filtroTexto = '';
  filtroTipoDocumentoId: number | null = null;
  filtroFacultadId: number | null = null;
  filtroFechaDesde = '';
  filtroFechaHasta = '';

  cargando = false;
  procesandoId: number | null = null;
  mensaje = '';
  error = '';

  private readonly router = inject(Router);
  private readonly documentosService = inject(DocumentosService);
  private readonly catalogosService = inject(CatalogosService);

  get documentosFiltrados(): Documento[] {
    const filtroTexto = this.filtroTexto.trim().toLowerCase();
    const fechaDesde = this.filtroFechaDesde ? new Date(`${this.filtroFechaDesde}T00:00:00`) : null;
    const fechaHasta = this.filtroFechaHasta ? new Date(`${this.filtroFechaHasta}T23:59:59.999`) : null;

    return this.documentos
      .filter((documento) => (documento.estado ?? '') === 'Pendiente')
      .filter((documento) => {
        if (filtroTexto) {
          const coincideTexto = [
            documento.titulo,
            documento.autor,
            documento.tipoDocumento,
            documento.facultad
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
    this.cargarPantalla();
  }

  cargarPantalla(): void {
    this.cargando = true;
    this.error = '';

    forkJoin({
      documentos: this.documentosService.getDocumentos(),
      tiposDocumento: this.catalogosService.getTiposDocumento(),
      facultades: this.catalogosService.getFacultades()
    }).subscribe({
      next: ({ documentos, tiposDocumento, facultades }) => {
        this.documentos = documentos;
        this.tiposDocumento = tiposDocumento;
        this.facultades = facultades;
        this.cargando = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar los documentos y catalogos de revision.';
        this.cargando = false;
      }
    });
  }

  abrirVisor(documento: Documento): void {
    const url = this.router.serializeUrl(
      this.router.createUrlTree(['/visor-documento', documento.id])
    );

    window.open(url, '_blank');
  }

  cambiarEstado(documento: Documento, estado: EstadoDocumento): void {
    this.mensaje = '';
    this.error = '';
    this.procesandoId = documento.id;

    this.documentosService.actualizarEstado(documento.id, estado).subscribe({
      next: (actualizado) => {
        this.documentos = this.documentos.map((item) =>
          item.id === actualizado.id ? actualizado : item
        );
        this.mensaje = `Documento actualizado a estado ${estado}.`;
        this.procesandoId = null;
      },
      error: () => {
        this.error = 'No se pudo actualizar el estado del documento.';
        this.procesandoId = null;
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

  getStatusClass(status?: string): string {
    switch (status) {
      case 'Publicado':
        return 'published';
      case 'Rechazado':
        return 'rejected';
      default:
        return 'pending';
    }
  }
}
