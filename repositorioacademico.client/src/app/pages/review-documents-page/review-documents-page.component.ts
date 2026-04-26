import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DocumentViewerModalComponent } from '../../components/document-viewer-modal/document-viewer-modal.component';
import { Documento } from '../../models/documento';
import { AuthService } from '../../services/auth.service';
import { DocumentosService } from '../../services/documentos.service';

@Component({
  selector: 'app-review-documents-page',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, DocumentViewerModalComponent],
  templateUrl: './review-documents-page.component.html',
  styleUrls: ['./review-documents-page.component.css']
})
export class ReviewDocumentsPageComponent implements OnInit {
  documentos: Documento[] = [];
  documentoSeleccionado: Documento | null = null;
  filtro = '';
  cargando = false;
  procesandoId: number | null = null;
  procesandoDescargaId: number | null = null;
  mensaje = '';
  error = '';

  private readonly authService = inject(AuthService);
  private readonly documentosService = inject(DocumentosService);

  get documentosFiltrados(): Documento[] {
    const filtro = this.filtro.trim().toLowerCase();
    const pendientes = this.documentos.filter((documento) =>
      ['Pendiente', 'Observado'].includes(documento.estado ?? '')
    );

    if (!filtro) {
      return pendientes;
    }

    return pendientes.filter((documento) =>
      [
        documento.titulo,
        documento.autor,
        documento.tipoDocumento,
        documento.facultad,
        documento.estado
      ].some((valor) => valor?.toLowerCase().includes(filtro))
    );
  }

  ngOnInit(): void {
    this.cargarDocumentos();
  }

  cargarDocumentos(): void {
    this.cargando = true;
    this.error = '';

    this.documentosService.getDocumentos().subscribe({
      next: (documentos) => {
        this.documentos = documentos;
        this.cargando = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar los documentos pendientes.';
        this.cargando = false;
      }
    });
  }

  abrirVisor(documento: Documento): void {
    this.documentoSeleccionado = documento;
  }

  cerrarVisor(): void {
    this.documentoSeleccionado = null;
  }

  alternarDescarga(documento: Documento): void {
    this.mensaje = '';
    this.error = '';
    this.procesandoDescargaId = documento.id;
    const sePuedeDescargar = documento.sePuedeDescargar === false;

    this.documentosService.actualizarDescarga(documento.id, sePuedeDescargar).subscribe({
      next: (actualizado) => {
        this.documentos = this.documentos.map((item) =>
          item.id === actualizado.id ? actualizado : item
        );

        if (this.documentoSeleccionado?.id === actualizado.id) {
          this.documentoSeleccionado = actualizado;
        }

        this.mensaje = actualizado.sePuedeDescargar === false
          ? 'La descarga del documento fue bloqueada.'
          : 'La descarga del documento fue habilitada.';
        this.procesandoDescargaId = null;
      },
      error: () => {
        this.error = 'No se pudo actualizar la politica de descarga del documento.';
        this.procesandoDescargaId = null;
      }
    });
  }

  cambiarEstado(documento: Documento, estado: 'Publicado' | 'Observado' | 'Rechazado'): void {
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

  puedeDescargar(documento: Documento): boolean {
    return this.authService.hasPermission('DOCUMENTO.DESCARGAR') && documento.sePuedeDescargar !== false;
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
}
