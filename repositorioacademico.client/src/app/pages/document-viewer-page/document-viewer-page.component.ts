import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Documento } from '../../models/documento';
import { AuthService } from '../../services/auth.service';
import { DocumentosService } from '../../services/documentos.service';

@Component({
  selector: 'app-document-viewer-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './document-viewer-page.component.html',
  styleUrls: ['./document-viewer-page.component.css']
})
export class DocumentViewerPageComponent implements OnInit, OnDestroy {
  documento: Documento | null = null;
  loading = true;
  downloading = false;
  error = '';
  previewUrl: SafeResourceUrl | null = null;

  private rawPreviewUrl: string | null = null;
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly authService = inject(AuthService);
  private readonly documentosService = inject(DocumentosService);

  ngOnInit(): void {
    const documentId = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isInteger(documentId) || documentId <= 0) {
      this.error = 'El documento solicitado no es valido.';
      this.loading = false;
      return;
    }

    this.documentosService.getDocumento(documentId).subscribe({
      next: (documento) => {
        this.documento = documento;
        this.loadPreview();
      },
      error: () => {
        this.error = 'No se pudo cargar la informacion del documento.';
        this.loading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.revokePreviewUrl();
  }

  closeWindow(): void {
    if (window.opener) {
      window.close();
      return;
    }

    this.router.navigate(['/repositorio']);
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
    return this.authService.hasPermission('DOCUMENTO.DESCARGAR') && this.documento?.sePuedeDescargar !== false;
  }

  getDownloadStatusLabel(): string {
    if (this.documento?.sePuedeDescargar === false) {
      return 'Documento solo para visualizacion';
    }

    if (!this.authService.hasPermission('DOCUMENTO.DESCARGAR')) {
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
          `${previewUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`
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
