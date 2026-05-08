import { CommonModule } from '@angular/common';
import { Component, DestroyRef, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { Catalogo } from '../../models/catalogo';
import { AuthService } from '../../services/auth.service';
import { CatalogosService } from '../../services/catalogos.service';
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
  facultadId: number | null = null;
  tutor = '';
  anioPublicacion: number | null = null;
  descripcion = '';
  palabrasClave = '';
  sePuedeDescargar = true;
  archivoSeleccionado: File | null = null;

  tiposDocumento: Catalogo[] = [];
  facultades: Catalogo[] = [];

  cargando = false;
  cargandoCatalogos = false;
  mensaje = '';
  error = '';

  private readonly destroyRef = inject(DestroyRef);
  private readonly authService = inject(AuthService);
  private readonly documentosService = inject(DocumentosService);
  private readonly catalogosService = inject(CatalogosService);

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

    this.catalogosService.facultadCreada$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((facultad) => {
        this.cargarCatalogos({ facultadSugeridaId: facultad.id });
      });
  }

  cargarCatalogos(opciones?: {
    tipoDocumentoSugeridoId?: number;
    facultadSugeridaId?: number;
  }): void {
    this.cargandoCatalogos = true;
    this.error = '';

    forkJoin({
      tiposDocumento: this.catalogosService.getTiposDocumento(),
      facultades: this.catalogosService.getFacultades()
    }).subscribe({
      next: ({ tiposDocumento, facultades }) => {
        this.tiposDocumento = tiposDocumento;
        this.facultades = facultades;

        if (
          this.tipoDocumentoId != null &&
          !tiposDocumento.some((tipoDocumento) => tipoDocumento.id === this.tipoDocumentoId)
        ) {
          this.tipoDocumentoId = null;
        }

        if (
          this.facultadId != null &&
          !facultades.some((facultad) => facultad.id === this.facultadId)
        ) {
          this.facultadId = null;
        }

        if (
          opciones?.tipoDocumentoSugeridoId != null &&
          tiposDocumento.some((tipoDocumento) => tipoDocumento.id === opciones.tipoDocumentoSugeridoId)
        ) {
          this.tipoDocumentoId = opciones.tipoDocumentoSugeridoId;
        } else if (this.tipoDocumentoId == null && tiposDocumento.length === 1) {
          this.tipoDocumentoId = tiposDocumento[0].id;
        }

        if (
          opciones?.facultadSugeridaId != null &&
          facultades.some((facultad) => facultad.id === opciones.facultadSugeridaId)
        ) {
          this.facultadId = opciones.facultadSugeridaId;
        } else if (this.facultadId == null && facultades.length === 1) {
          this.facultadId = facultades[0].id;
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
      this.facultadId == null ||
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
    formData.append('facultadId', this.facultadId.toString());
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
    this.facultadId = null;
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
}
