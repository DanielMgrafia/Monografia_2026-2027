import { CommonModule, DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { forkJoin, switchMap } from 'rxjs';
import { Catalogo } from '../../models/catalogo';
import { Documento } from '../../models/documento';
import { AuthService } from '../../services/auth.service';
import { CatalogosService } from '../../services/catalogos.service';
import { DocumentosService } from '../../services/documentos.service';

interface SummaryCard {
  label: string;
  value: number;
  description: string;
  tone: 'urgent' | 'success' | 'warning' | 'info';
  icon: string;
}

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.css']
})
export class DashboardHomeComponent implements OnInit {
  readonly loading = signal(true);
  readonly error = signal('');
  readonly documentos = signal<Documento[]>([]);
  readonly tiposDocumento = signal<Catalogo[]>([]);
  readonly facultades = signal<Catalogo[]>([]);

  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  readonly authService = inject(AuthService);
  private readonly documentosService = inject(DocumentosService);
  private readonly catalogosService = inject(CatalogosService);

  readonly isAdministrator = computed(() =>
    this.authService
      .roles()
      .some((role) => role.nombre.trim().toLowerCase() === 'administrador')
  );
  readonly canViewRepository = computed(() => this.authService.hasPermission('REPOSITORIO.VER'));
  readonly canPublishDocuments = computed(() => this.authService.hasPermission('DOCUMENTO.PUBLICAR'));

  readonly pendingDocuments = computed(() =>
    this.documentos()
      .filter((documento) => (documento.estado ?? '') === 'Pendiente')
      .sort((left, right) => new Date(right.fechaSubida).getTime() - new Date(left.fechaSubida).getTime())
      .slice(0, 5)
  );

  readonly publishedDocuments = computed(() =>
    this.documentos()
      .filter((documento) => (documento.estado ?? '') === 'Publicado')
      .sort((left, right) => new Date(right.fechaSubida).getTime() - new Date(left.fechaSubida).getTime())
      .slice(0, 5)
  );

  readonly summaryCards = computed<SummaryCard[]>(() => {
    const documentos = this.documentos();
    const pendientes = documentos.filter((documento) => (documento.estado ?? '') === 'Pendiente').length;
    const publicados = documentos.filter((documento) => (documento.estado ?? '') === 'Publicado').length;
    const tiposDisponibles = this.tiposDocumento().length;
    const facultadesDisponibles = this.facultades().length;
    const catalogosActivos = tiposDisponibles + facultadesDisponibles;
    const cards: SummaryCard[] = [];

    if (this.canPublishDocuments()) {
      cards.push({
        label: 'Pendientes de revision',
        value: pendientes,
        description: 'Documentos esperando autorizacion',
        tone: 'urgent',
        icon: 'PD'
      });
    }

    if (this.canViewRepository()) {
      cards.push({
        label: 'Publicados',
        value: publicados,
        description: 'Documentos visibles en el repositorio',
        tone: 'success',
        icon: 'OK'
      });
    }

    if (this.isAdministrator()) {
      cards.push({
        label: 'Catalogos activos',
        value: catalogosActivos,
        description: 'Tipos y facultades disponibles',
        tone: 'info',
        icon: 'CT'
      });
    }

    return cards;
  });

  readonly sidePanelTipos = computed(() =>
    this.isAdministrator() ? this.tiposDocumento().slice(0, 4) : []
  );
  readonly sidePanelFacultades = computed(() =>
    this.isAdministrator() ? this.facultades().slice(0, 4) : []
  );

  readonly recentActivity = computed(() =>
    this.documentos()
      .filter((documento) => {
        if (this.canPublishDocuments()) {
          return true;
        }

        return (documento.estado ?? '') === 'Publicado';
      })
      .slice()
      .sort((left, right) => new Date(right.fechaSubida).getTime() - new Date(left.fechaSubida).getTime())
      .slice(0, 4)
  );

  ngOnInit(): void {
    this.loadDashboardData();

    this.documentosService.documentosActualizados$
      .pipe(
        switchMap(() => this.documentosService.getDocumentos()),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (documentos) => this.documentos.set(documentos)
      });
  }

  goTo(route: string): void {
    this.router.navigate([route]);
  }

  openDocumentViewer(documento: Documento): void {
    const url = this.router.serializeUrl(
      this.router.createUrlTree(['/visor-documento', documento.id])
    );

    window.open(url, '_blank');
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

  getActivityTitle(): string {
    return this.canPublishDocuments() ? 'Actividad reciente' : 'Publicaciones recientes';
  }

  getActivityDescription(): string {
    return this.canPublishDocuments()
      ? 'Ultimos movimientos dentro del repositorio.'
      : 'Ultimos documentos publicados dentro del repositorio.';
  }

  getActivityMessage(documento: Documento): string {
    const autor = documento.autor?.trim() || 'Un autor';

    switch (documento.estado) {
      case 'Publicado':
        return `${autor} publico un documento en el repositorio.`;
      case 'Rechazado':
        return `${autor} tiene un documento rechazado.`;
      default:
        return `${autor} envio un documento para revision.`;
    }
  }

  private loadDashboardData(): void {
    forkJoin({
      documentos: this.documentosService.getDocumentos(),
      tiposDocumento: this.catalogosService.getTiposDocumento(),
      facultades: this.catalogosService.getFacultades()
    }).subscribe({
      next: ({ documentos, tiposDocumento, facultades }) => {
        this.documentos.set(documentos);
        this.tiposDocumento.set(tiposDocumento);
        this.facultades.set(facultades);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la informacion del panel.');
        this.loading.set(false);
      }
    });
  }
}
