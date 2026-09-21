import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Catalogo } from '../../models/catalogo';
import { Carrera } from '../../models/carrera';
import { Documento } from '../../models/documento';
import { SublineaInvestigacion } from '../../models/sublinea-investigacion';
import { CatalogosService } from '../../services/catalogos.service';
import { CarrerasService } from '../../services/carreras.service';
import { DocumentosService } from '../../services/documentos.service';

type EstadoDocumento = 'Pendiente' | 'Publicado' | 'Rechazado';

interface DocumentoEditModel {
  titulo: string;
  autor: string;
  tipoDocumentoId: number | null;
  carreraId: number | null;
  lineaInvestigacionId: number | null;
  sublineaInvestigacionId: number | null;
  tutor: string;
  anioPublicacion: number | null;
  descripcion: string;
  palabrasClave: string;
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
  readonly estadosDisponibles: EstadoDocumento[] = ['Pendiente', 'Publicado', 'Rechazado'];

  documentos: Documento[] = [];
  tiposDocumento: Catalogo[] = [];
  carreras: Carrera[] = [];
  lineasInvestigacion: Catalogo[] = [];
  sublineasInvestigacion: SublineaInvestigacion[] = [];

  filtroTexto = '';
  filtroEstado = '';
  filtroTipoDocumentoId: number | null = null;
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
  private readonly carrerasService = inject(CarrerasService);

  get carrerasDisponibles(): Carrera[] {
    return this.carreras;
  }

  get lineasDisponibles(): Catalogo[] {
    if (this.editModel.carreraId == null) {
      return this.lineasInvestigacion;
    }

    const carrera = this.carreras.find((item) => item.id === this.editModel.carreraId);
    return carrera?.lineasInvestigacion ?? [];
  }

  get sublineasDisponibles(): SublineaInvestigacion[] {
    if (this.editModel.lineaInvestigacionId == null) {
      return this.sublineasInvestigacion;
    }

    return this.sublineasInvestigacion.filter(
      (sublinea) => sublinea.lineaInvestigacionId === this.editModel.lineaInvestigacionId
    );
  }

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
            documento.carrera,
            documento.lineaInvestigacion,
            documento.sublineaInvestigacion,
            documento.estado,
            documento.tutor,
            documento.descripcion,
            documento.palabrasClave
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
      carreras: this.carrerasService.getCarreras(),
      lineasInvestigacion: this.catalogosService.getLineasInvestigacion(),
      sublineasInvestigacion: this.catalogosService.getSublineasInvestigacion()
    }).subscribe({
      next: ({ documentos, tiposDocumento, carreras, lineasInvestigacion, sublineasInvestigacion }) => {
        this.documentos = documentos;
        this.tiposDocumento = tiposDocumento;
        this.carreras = carreras;
        this.lineasInvestigacion = lineasInvestigacion;
        this.sublineasInvestigacion = sublineasInvestigacion;
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
      carreraId: documento.carreraId ?? null,
      lineaInvestigacionId: documento.lineaInvestigacionId ?? null,
      sublineaInvestigacionId: documento.sublineaInvestigacionId ?? null,
      tutor: documento.tutor?.trim() ?? '',
      anioPublicacion: documento.anioPublicacion ?? null,
      descripcion: documento.descripcion?.trim() ?? '',
      palabrasClave: documento.palabrasClave?.trim() ?? '',
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

    if (
      !this.editModel.titulo.trim() ||
      !this.editModel.autor.trim() ||
      !this.editModel.tutor.trim() ||
      !this.editModel.descripcion.trim() ||
      !this.editModel.palabrasClave.trim() ||
      this.editModel.anioPublicacion == null
    ) {
      this.error = 'Completa los metadatos obligatorios antes de guardar cambios.';
      return;
    }

    if (this.editModel.tipoDocumentoId == null) {
      this.error = 'Debes seleccionar el tipo de documento.';
      return;
    }

    this.guardandoEdicion = true;

    this.documentosService.actualizarDocumento(this.documentoEnEdicion.id, {
      titulo: this.editModel.titulo.trim(),
      autor: this.editModel.autor.trim(),
      tipoDocumentoId: this.editModel.tipoDocumentoId,
      carreraId: this.editModel.carreraId,
      lineaInvestigacionId: this.editModel.lineaInvestigacionId,
      sublineaInvestigacionId: this.editModel.sublineaInvestigacionId,
      tutor: this.editModel.tutor.trim(),
      anioPublicacion: this.editModel.anioPublicacion,
      descripcion: this.editModel.descripcion.trim(),
      palabrasClave: this.editModel.palabrasClave.trim(),
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
        return 'published';
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
        carreraId: actualizado.carreraId ?? null,
        lineaInvestigacionId: actualizado.lineaInvestigacionId ?? null,
        sublineaInvestigacionId: actualizado.sublineaInvestigacionId ?? null,
        tutor: actualizado.tutor?.trim() ?? '',
        anioPublicacion: actualizado.anioPublicacion ?? null,
        descripcion: actualizado.descripcion?.trim() ?? '',
        palabrasClave: actualizado.palabrasClave?.trim() ?? '',
        estado: this.normalizeEstado(actualizado.estado),
        sePuedeDescargar: actualizado.sePuedeDescargar !== false
      };
    }
  }

  private normalizeEstado(estado?: string): EstadoDocumento {
    switch (estado) {
      case 'Publicado':
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
      carreraId: null,
      lineaInvestigacionId: null,
      sublineaInvestigacionId: null,
      tutor: '',
      anioPublicacion: null,
      descripcion: '',
      palabrasClave: '',
      estado: 'Pendiente',
      sePuedeDescargar: true
    };
  }

  actualizarDependientesDesdeCarrera(): void {
    if (
      this.editModel.lineaInvestigacionId != null &&
      !this.lineasDisponibles.some((linea) => linea.id === this.editModel.lineaInvestigacionId)
    ) {
      this.editModel.lineaInvestigacionId = null;
      this.editModel.sublineaInvestigacionId = null;
    }
  }

  actualizarDependientesDesdeLinea(): void {
    if (
      this.editModel.sublineaInvestigacionId != null &&
      !this.sublineasDisponibles.some((sublinea) => sublinea.id === this.editModel.sublineaInvestigacionId)
    ) {
      this.editModel.sublineaInvestigacionId = null;
    }
  }

  getClasificacionPrincipal(documento: Documento): string {
    return documento.carrera ||
      documento.lineaInvestigacion ||
      documento.sublineaInvestigacion ||
      documento.tipoDocumento ||
      'Sin clasificacion';
  }
}
