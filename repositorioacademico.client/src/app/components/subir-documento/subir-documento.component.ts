import { CommonModule } from '@angular/common';
import { Component, DestroyRef, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { Catalogo } from '../../models/catalogo';
import { Carrera } from '../../models/carrera';
import { SublineaInvestigacion } from '../../models/sublinea-investigacion';
import { AuthService } from '../../services/auth.service';
import { CatalogosService } from '../../services/catalogos.service';
import { CarrerasService } from '../../services/carreras.service';
import { DocumentosService } from '../../services/documentos.service';

@Component({
  selector: 'app-subir-documento',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './subir-documento.component.html',
  styleUrls: ['./subir-documento.component.css']
})
export class SubirDocumentoComponent implements OnInit {
  @ViewChild('archivoInput') archivoInput?: ElementRef<HTMLInputElement>;

  titulo = '';
  autor = '';
  tipoDocumentoId: number | null = null;
  carreraId: number | null = null;
  lineaInvestigacionId: number | null = null;
  sublineaInvestigacionId: number | null = null;
  tutor = '';
  anioPublicacion: number | null = null;
  descripcion = '';
  palabrasClave = '';
  sePuedeDescargar = true;
  archivoSeleccionado: File | null = null;

  tiposDocumento: Catalogo[] = [];
  carreras: Carrera[] = [];
  lineasInvestigacion: Catalogo[] = [];
  sublineasInvestigacion: SublineaInvestigacion[] = [];

  cargando = false;
  cargandoCatalogos = false;
  mensaje = '';
  error = '';

  private readonly destroyRef = inject(DestroyRef);
  private readonly authService = inject(AuthService);
  private readonly documentosService = inject(DocumentosService);
  private readonly catalogosService = inject(CatalogosService);
  private readonly carrerasService = inject(CarrerasService);

  get carrerasDisponibles(): Carrera[] {
    return this.carreras;
  }

  get lineasDisponibles(): Catalogo[] {
    if (this.carreraId == null) {
      return this.lineasInvestigacion;
    }

    const carrera = this.carreras.find((item) => item.id === this.carreraId);
    return carrera?.lineasInvestigacion ?? [];
  }

  get sublineasDisponibles(): SublineaInvestigacion[] {
    if (this.lineaInvestigacionId == null) {
      return this.sublineasInvestigacion;
    }

    return this.sublineasInvestigacion.filter(
      (sublinea) => sublinea.lineaInvestigacionId === this.lineaInvestigacionId
    );
  }

  ngOnInit(): void {
    const currentUser = this.authService.currentUser();
    if (currentUser && !this.autor.trim()) {
      this.autor = `${currentUser.nombres} ${currentUser.apellidos}`.trim();
    }

    this.cargarCatalogos();
    this.catalogosService.tipoDocumentoCreado$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((tipoDocumento) => {
        this.cargarCatalogos({ tipoDocumentoSugeridoId: tipoDocumento.id });
      });

  }

  cargarCatalogos(opciones?: {
    tipoDocumentoSugeridoId?: number;
  }): void {
    this.cargandoCatalogos = true;
    this.error = '';

    forkJoin({
      tiposDocumento: this.catalogosService.getTiposDocumento(),
      carreras: this.carrerasService.getCarreras(),
      lineasInvestigacion: this.catalogosService.getLineasInvestigacion(),
      sublineasInvestigacion: this.catalogosService.getSublineasInvestigacion()
    }).subscribe({
      next: ({ tiposDocumento, carreras, lineasInvestigacion, sublineasInvestigacion }) => {
        this.tiposDocumento = tiposDocumento;
        this.carreras = carreras;
        this.lineasInvestigacion = lineasInvestigacion;
        this.sublineasInvestigacion = sublineasInvestigacion;

        if (
          this.tipoDocumentoId != null &&
          !tiposDocumento.some((tipoDocumento) => tipoDocumento.id === this.tipoDocumentoId)
        ) {
          this.tipoDocumentoId = null;
        }

        this.actualizarDependientesDesdeCarrera();
        this.actualizarDependientesDesdeLinea();

        if (
          opciones?.tipoDocumentoSugeridoId != null &&
          tiposDocumento.some((tipoDocumento) => tipoDocumento.id === opciones.tipoDocumentoSugeridoId)
        ) {
          this.tipoDocumentoId = opciones.tipoDocumentoSugeridoId;
        } else if (this.tipoDocumentoId == null && tiposDocumento.length === 1) {
          this.tipoDocumentoId = tiposDocumento[0].id;
        }

        this.cargandoCatalogos = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar los catalogos.';
        this.cargandoCatalogos = false;
      }
    });
  }

  seleccionarArchivo(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      this.archivoSeleccionado = null;
      return;
    }

    const archivo = input.files[0];
    const extension = archivo.name.split('.').pop()?.toLowerCase();
    const esPdf = archivo.type === 'application/pdf' || extension === 'pdf';
    const esDocx =
      archivo.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      extension === 'docx';

    if (!esPdf && !esDocx) {
      this.error = 'Solo se permiten archivos PDF y Word.';
      this.archivoSeleccionado = null;
      return;
    }

    this.archivoSeleccionado = archivo;
    this.error = '';
  }

  guardarDocumento(): void {
    this.mensaje = '';
    this.error = '';

    if (
      !this.titulo.trim() ||
      !this.autor.trim() ||
      this.tipoDocumentoId == null ||
      !this.tutor.trim() ||
      this.anioPublicacion == null ||
      !this.descripcion.trim() ||
      !this.palabrasClave.trim()
    ) {
      this.error = 'Completa todos los campos obligatorios.';
      return;
    }

    if (!this.archivoSeleccionado) {
      this.error = 'Debes seleccionar un archivo.';
      return;
    }

    const currentUser = this.authService.currentUser();
    if (!currentUser) {
      this.error = 'No se encontro una sesion activa.';
      return;
    }

    const formData = new FormData();
    formData.append('archivo', this.archivoSeleccionado);
    formData.append('titulo', this.titulo.trim());
    formData.append('autor', this.autor.trim());
    formData.append('tipoDocumentoId', this.tipoDocumentoId.toString());
    if (this.carreraId != null) {
      formData.append('carreraId', this.carreraId.toString());
    }
    if (this.lineaInvestigacionId != null) {
      formData.append('lineaInvestigacionId', this.lineaInvestigacionId.toString());
    }
    if (this.sublineaInvestigacionId != null) {
      formData.append('sublineaInvestigacionId', this.sublineaInvestigacionId.toString());
    }
    formData.append('tutor', this.tutor.trim());
    formData.append('anioPublicacion', this.anioPublicacion.toString());
    formData.append('descripcion', this.descripcion.trim());
    formData.append('palabrasClave', this.palabrasClave.trim());
    formData.append('sePuedeDescargar', String(this.sePuedeDescargar));

    this.cargando = true;

    this.documentosService.subirDocumento(formData).subscribe({
      next: () => {
        this.mensaje = 'Documento subido correctamente.';
        this.limpiarFormulario();
        this.cargando = false;
      },
      error: () => {
        this.error = 'Ocurrio un error al subir el documento.';
        this.cargando = false;
      }
    });
  }

  limpiarFormulario(): void {
    this.titulo = '';
    this.autor = '';
    this.tipoDocumentoId = null;
    this.carreraId = null;
    this.lineaInvestigacionId = null;
    this.sublineaInvestigacionId = null;
    this.tutor = '';
    this.anioPublicacion = null;
    this.descripcion = '';
    this.palabrasClave = '';
    this.sePuedeDescargar = true;
    this.archivoSeleccionado = null;
    if (this.archivoInput) {
      this.archivoInput.nativeElement.value = '';
    }
  }

  actualizarDependientesDesdeCarrera(): void {
    if (
      this.lineaInvestigacionId != null &&
      !this.lineasDisponibles.some((linea) => linea.id === this.lineaInvestigacionId)
    ) {
      this.lineaInvestigacionId = null;
      this.sublineaInvestigacionId = null;
    }
  }

  actualizarDependientesDesdeLinea(): void {
    if (
      this.sublineaInvestigacionId != null &&
      !this.sublineasDisponibles.some((sublinea) => sublinea.id === this.sublineaInvestigacionId)
    ) {
      this.sublineaInvestigacionId = null;
    }
  }
}
