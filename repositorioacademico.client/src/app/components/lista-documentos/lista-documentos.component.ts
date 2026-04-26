import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Documento } from '../../models/documento';
import { AuthService } from '../../services/auth.service';
import { DocumentosService } from '../../services/documentos.service';

@Component({
  selector: 'app-lista-documentos',
  templateUrl: './lista-documentos.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ['./lista-documentos.component.css']
})
export class ListaDocumentosComponent implements OnInit {
  documentos: Documento[] = [];
  filtro = '';
  cargando = false;
  error = '';

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly documentosService = inject(DocumentosService);

  get documentosFiltrados(): Documento[] {
    const filtro = this.filtro.trim().toLowerCase();
    if (!filtro) {
      return this.documentos;
    }

    return this.documentos.filter((documento) =>
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
    this.route.queryParamMap.subscribe((params) => {
      this.filtro = params.get('q') ?? '';
    });
  }

  cargarDocumentos(): void {
    this.cargando = true;
    this.error = '';

    this.documentosService.getDocumentos().subscribe({
      next: (data) => {
        this.documentos = data;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar documentos', error);
        this.error = 'No se pudieron cargar los documentos.';
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

  getStatusClass(status?: string): string {
    switch (status) {
      case 'Publicado':
      case 'Aprobado':
        return 'estado-publicado';
      case 'Observado':
        return 'estado-observado';
      case 'Rechazado':
        return 'estado-rechazado';
      default:
        return 'estado-pendiente';
    }
  }
}
