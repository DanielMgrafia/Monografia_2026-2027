import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Documento } from '../../models/documento';
import { DocumentosService } from '../../services/documentos.service';

@Component({
  selector: 'app-document-viewer-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './document-viewer-modal.component.html',
  styleUrls: ['./document-viewer-modal.component.css']
})
export class DocumentViewerModalComponent implements OnChanges, OnDestroy {
  @Input() documento: Documento | null = null;
  @Input() canDownload = false;
  @Output() closeRequested = new EventEmitter<void>();

  loading = false;
  downloading = false;
  error = '';
  previewUrl: SafeResourceUrl | null = null;

  private rawPreviewUrl: string | null = null;
  private readonly sanitizer = inject(DomSanitizer);
  private readonly documentosService = inject(DocumentosService);

  ngOnChanges(changes: SimpleChanges): void {
    if ('documento' in changes) {
      this.loadPreview();
    }
  }

  ngOnDestroy(): void {
    this.revokePreviewUrl();
  }

  close(): void {
    this.closeRequested.emit();
  }

  descargar(): void {
    if (!this.documento || !this.isDownloadEnabled()) {
      return;
    }

    this.downloading = true;
    this.error = '';

    this.documentosService.descargarDocumento(this.documento.id).subscribe({
      next: (response) => {
        const blob = response.body;
        if (!blob) {
          this.error = 'No se pudo preparar la descarga del archivo.';
          this.downloading = false;
          return;
        }

        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = this.buildDownloadName();
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(downloadUrl);
        this.downloading = false;
      },
      error: () => {
        this.error = 'No fue posible descargar el archivo.';
        this.downloading = false;
      }
    });
  }

  isPdfDocument(): boolean {
    return this.getExtension() === 'pdf';
  }

  isDownloadEnabled(): boolean {
    return this.canDownload && this.documento?.sePuedeDescargar !== false;
  }

  getDownloadStatusLabel(): string {
    if (this.documento?.sePuedeDescargar === false) {
      return 'Documento solo para visualizacion';
    }

    if (!this.canDownload) {
      return 'Tu rol no tiene permiso para descargar';
    }

    return 'Descarga habilitada';
  }

  private loadPreview(): void {
    this.error = '';
    this.loading = false;
    this.revokePreviewUrl();

    if (!this.documento || !this.isPdfDocument()) {
      return;
    }

    this.loading = true;
    this.documentosService.visualizarDocumento(this.documento.id).subscribe({
      next: (blob) => {
        const previewUrl = URL.createObjectURL(blob);
        this.rawPreviewUrl = previewUrl;
        this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
          `${previewUrl}#toolbar=0&navpanes=0&scrollbar=1`
        );
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudo cargar la vista previa del documento.';
        this.loading = false;
      }
    });
  }

  private revokePreviewUrl(): void {
    if (!this.rawPreviewUrl) {
      this.previewUrl = null;
      return;
    }

    URL.revokeObjectURL(this.rawPreviewUrl);
    this.rawPreviewUrl = null;
    this.previewUrl = null;
  }

  private buildDownloadName(): string {
    const titulo = (this.documento?.titulo ?? 'documento')
      .replace(/[\\/:*?"<>|]+/g, ' ')
      .trim();

    const extension = this.getExtension();
    return extension ? `${titulo || 'documento'}.${extension}` : (titulo || 'documento');
  }

  private getExtension(): string {
    const ruta = this.documento?.rutaDocumento ?? '';
    const lastDot = ruta.lastIndexOf('.');
    return lastDot >= 0 ? ruta.slice(lastDot + 1).toLowerCase() : '';
  }
}
