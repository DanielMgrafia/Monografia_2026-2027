import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Catalogo } from '../../models/catalogo';
import { Documento } from '../../models/documento';
import { CatalogosService } from '../../services/catalogos.service';
import { DocumentosService } from '../../services/documentos.service';

type EstadoDocumento = 'Pendiente' | 'Publicado' | 'Observado' | 'Rechazado';

interface DocumentoEditModel {
  titulo: string;
  autor: string;
  tipoDocumentoId: number | null;
  facultadId: number | null;
  estado: EstadoDocumento;
  sePuedeDescargar: boolean;
}

@Component({
  selector: 'app-edit-documents-page',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './edit-documents-page.component.html',
  styleUrls: ['./edit-documents-page.component.css']
})
export class EditDocumentsPageComponent implements OnInit {
  readonly estadosDisponibles: EstadoDocumento[] = ['Pendiente', 'Publicado', 'Observado', 'Rechazado'];

  documentos: Documento[] = [];
  tiposDocumento: Catalogo[] = [];
  facultades: Catalogo[] = [];

  filtroTexto = '';
  filtroEstado = '';
  filtroTipoDocumentoId: number | null = null;
  filtroFacultadId: number | null = null;
  filtroFechaDesde = '';
  filtroFechaHasta = '';

  documentoEnEdicion: Documento | null = null;
  editModel: DocumentoEditModel = this.createEmptyEditModel();

  cargando = false;
  guardandoEdicion = false;
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
      .filter((documento) => {
        if (filtroTexto) {
          const coincideTexto = [
            documento.titulo,
            documento.autor,
            documento.tipoDocumento,
            documento.facultad,
            documento.estado
          ].some((valor) => valor?.toLowerCase().includes(filtroTexto));

          if (!coincideTexto) {
            return false;
          }
        }

        if (this.filtroEstado && documento.estado !== this.filtroEstado) {
          return false;
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
        this.error = 'No se pudieron cargar los documentos y catalogos de edicion.';
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

  abrirEdicion(documento: Documento): void {
    this.mensaje = '';
    this.error = '';
    this.documentoEnEdicion = documento;
    this.editModel = {
      titulo: documento.titulo?.trim() ?? '',
      autor: documento.autor?.trim() ?? '',
      tipoDocumentoId: documento.tipoDocumentoId,
      facultadId: documento.facultadId,
      estado: this.normalizeEstado(documento.estado),
      sePuedeDescargar: documento.sePuedeDescargar !== false
    };
  }

  cancelarEdicion(): void {
    this.documentoEnEdicion = null;
    this.editModel = this.createEmptyEditModel();
  }

  guardarEdicion(): void {
    if (!this.documentoEnEdicion) {
      return;
    }

    this.mensaje = '';
    this.error = '';

    if (!this.editModel.titulo.trim() || !this.editModel.autor.trim()) {
      this.error = 'El titulo y el autor son obligatorios para guardar cambios.';
      return;
    }

    if (this.editModel.tipoDocumentoId == null || this.editModel.facultadId == null) {
      this.error = 'Debes seleccionar facultad y tipo de documento.';
      return;
    }

    this.guardandoEdicion = true;

    this.documentosService.actualizarDocumento(this.documentoEnEdicion.id, {
      titulo: this.editModel.titulo.trim(),
      autor: this.editModel.autor.trim(),
      tipoDocumentoId: this.editModel.tipoDocumentoId,
      facultadId: this.editModel.facultadId,
      estado: this.editModel.estado,
      sePuedeDescargar: this.editModel.sePuedeDescargar
    }).subscribe({
      next: (actualizado) => {
        this.replaceDocumento(actualizado);
        this.mensaje = 'Los cambios del documento se guardaron correctamente.';
        this.guardandoEdicion = false;
        this.cancelarEdicion();
      },
      error: () => {
        this.error = 'No se pudieron guardar los cambios del documento.';
        this.guardandoEdicion = false;
      }
    });
  }

  limpiarFiltros(): void {
    this.filtroTexto = '';
    this.filtroEstado = '';
    this.filtroTipoDocumentoId = null;
    this.filtroFacultadId = null;
    this.filtroFechaDesde = '';
    this.filtroFechaHasta = '';
  }

  getDownloadStatusClass(documento: Documento): string {
    return documento.sePuedeDescargar === false ? 'restricted' : 'published';
  }

  getDownloadStatusLabel(documento: Documento): string {
    return documento.sePuedeDescargar === false ? 'Bloqueada' : 'Permitida';
  }

  getStatusClass(status?: string): string {
    switch (status) {
      case 'Publicado':
      case 'Aprobado':
        return 'published';
      case 'Observado':
        return 'observed';
      case 'Rechazado':
        return 'rejected';
      default:
        return 'pending';
    }
  }

  private replaceDocumento(actualizado: Documento): void {
    this.documentos = this.documentos.map((item) =>
      item.id === actualizado.id ? actualizado : item
    );

    if (this.documentoEnEdicion?.id === actualizado.id) {
      this.documentoEnEdicion = actualizado;
      this.editModel = {
        titulo: actualizado.titulo?.trim() ?? '',
        autor: actualizado.autor?.trim() ?? '',
        tipoDocumentoId: actualizado.tipoDocumentoId,
        facultadId: actualizado.facultadId,
        estado: this.normalizeEstado(actualizado.estado),
        sePuedeDescargar: actualizado.sePuedeDescargar !== false
      };
    }
  }

  private normalizeEstado(estado?: string): EstadoDocumento {
    switch (estado) {
      case 'Publicado':
      case 'Observado':
      case 'Rechazado':
        return estado;
      default:
        return 'Pendiente';
    }
  }

  private createEmptyEditModel(): DocumentoEditModel {
    return {
      titulo: '',
      autor: '',
      tipoDocumentoId: null,
      facultadId: null,
      estado: 'Pendiente',
      sePuedeDescargar: true
    };
  }
}
