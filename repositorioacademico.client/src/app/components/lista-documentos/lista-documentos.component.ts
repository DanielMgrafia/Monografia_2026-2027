import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { BibliotecaService } from '../../services/biblioteca.service';
import { Catalogo } from '../../models/catalogo';
import { Carrera } from '../../models/carrera';
import { Documento } from '../../models/documento';
import { SublineaInvestigacion } from '../../models/sublinea-investigacion';
import { AuthService } from '../../services/auth.service';
import { CatalogosService } from '../../services/catalogos.service';
import { CarrerasService } from '../../services/carreras.service';
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
  areasConocimiento: Catalogo[] = [];
  lineasInvestigacion: Catalogo[] = [];
  sublineasInvestigacion: SublineaInvestigacion[] = [];
  carreras: Carrera[] = [];

  filtroTexto = '';
  filtroTipoDocumentoId: number | null = null;
  filtroFacultadId: number | null = null;
  filtroAreaConocimientoId: number | null = null;
  filtroCarreraId: number | null = null;
  filtroLineaInvestigacionId: number | null = null;
  filtroSublineaInvestigacionId: number | null = null;
  filtroFechaDesde = '';
  filtroFechaHasta = '';
  filtrosAbiertos = false;

  cargando = false;
  favoritoCambiandoId: number | null = null;
  error = '';

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly bibliotecaService = inject(BibliotecaService);
  private readonly catalogosService = inject(CatalogosService);
  private readonly carrerasService = inject(CarrerasService);
  private readonly documentosService = inject(DocumentosService);

  get carrerasFiltradas(): Carrera[] {
    return this.carreras.filter((carrera) => {
      if (this.filtroFacultadId != null && carrera.facultadId !== this.filtroFacultadId) {
        return false;
      }

      if (this.filtroAreaConocimientoId != null && carrera.areaConocimientoId !== this.filtroAreaConocimientoId) {
        return false;
      }

      return true;
    });
  }

  get lineasFiltradas(): Catalogo[] {
    if (this.filtroCarreraId == null) {
      return this.lineasInvestigacion;
    }

    const carrera = this.carreras.find((item) => item.id === this.filtroCarreraId);
    return carrera?.lineasInvestigacion ?? [];
  }

  get sublineasFiltradas(): SublineaInvestigacion[] {
    if (this.filtroLineaInvestigacionId == null) {
      return this.sublineasInvestigacion;
    }

    return this.sublineasInvestigacion.filter(
      (sublinea) => sublinea.lineaInvestigacionId === this.filtroLineaInvestigacionId
    );
  }

  get filtrosActivos(): number {
    return [
      this.filtroTipoDocumentoId,
      this.filtroFacultadId,
      this.filtroAreaConocimientoId,
      this.filtroCarreraId,
      this.filtroLineaInvestigacionId,
      this.filtroSublineaInvestigacionId,
      this.filtroFechaDesde,
      this.filtroFechaHasta
    ].filter((valor) => valor !== null && valor !== '').length;
  }

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
            documento.carrera,
            documento.lineaInvestigacion,
            documento.sublineaInvestigacion,
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

        if (this.filtroAreaConocimientoId != null) {
          const carrera = this.carreras.find((item) => item.id === documento.carreraId);
          if (!carrera || carrera.areaConocimientoId !== this.filtroAreaConocimientoId) {
            return false;
          }
        }

        if (this.filtroCarreraId != null && documento.carreraId !== this.filtroCarreraId) {
          return false;
        }

        if (
          this.filtroLineaInvestigacionId != null &&
          documento.lineaInvestigacionId !== this.filtroLineaInvestigacionId
        ) {
          return false;
        }

        if (
          this.filtroSublineaInvestigacionId != null &&
          documento.sublineaInvestigacionId !== this.filtroSublineaInvestigacionId
        ) {
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
      facultades: this.catalogosService.getFacultades(),
      areasConocimiento: this.catalogosService.getAreasConocimiento(),
      lineasInvestigacion: this.catalogosService.getLineasInvestigacion(),
      sublineasInvestigacion: this.catalogosService.getSublineasInvestigacion(),
      carreras: this.carrerasService.getCarreras()
    }).subscribe({
      next: ({
        documentos,
        recomendaciones,
        tiposDocumento,
        facultades,
        areasConocimiento,
        lineasInvestigacion,
        sublineasInvestigacion,
        carreras
      }) => {
        this.documentos = documentos;
        this.recomendaciones = recomendaciones;
        this.tiposDocumento = tiposDocumento;
        this.facultades = facultades;
        this.areasConocimiento = areasConocimiento;
        this.lineasInvestigacion = lineasInvestigacion;
        this.sublineasInvestigacion = sublineasInvestigacion;
        this.carreras = carreras;
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
    this.filtroAreaConocimientoId = null;
    this.filtroCarreraId = null;
    this.filtroLineaInvestigacionId = null;
    this.filtroSublineaInvestigacionId = null;
    this.filtroFechaDesde = '';
    this.filtroFechaHasta = '';
  }

  abrirFiltros(): void {
    this.filtrosAbiertos = true;
  }

  cerrarFiltros(): void {
    this.filtrosAbiertos = false;
  }

  actualizarDependientesDesdeFacultad(): void {
    if (
      this.filtroCarreraId != null &&
      !this.carrerasFiltradas.some((carrera) => carrera.id === this.filtroCarreraId)
    ) {
      this.filtroCarreraId = null;
      this.filtroLineaInvestigacionId = null;
      this.filtroSublineaInvestigacionId = null;
    }
  }

  actualizarDependientesDesdeArea(): void {
    this.actualizarDependientesDesdeFacultad();
  }

  actualizarDependientesDesdeCarrera(): void {
    if (
      this.filtroLineaInvestigacionId != null &&
      !this.lineasFiltradas.some((linea) => linea.id === this.filtroLineaInvestigacionId)
    ) {
      this.filtroLineaInvestigacionId = null;
      this.filtroSublineaInvestigacionId = null;
    }
  }

  actualizarDependientesDesdeLinea(): void {
    if (
      this.filtroSublineaInvestigacionId != null &&
      !this.sublineasFiltradas.some((sublinea) => sublinea.id === this.filtroSublineaInvestigacionId)
    ) {
      this.filtroSublineaInvestigacionId = null;
    }
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
