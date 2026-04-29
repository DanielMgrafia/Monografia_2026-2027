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

interface QuickAction {
  title: string;
  description: string;
  route: string;
  permission: string;
  accent: 'blue' | 'green' | 'purple';
  icon: string;
}

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

  readonly canViewRepository = computed(() => this.authService.hasPermission('REPOSITORIO.VER'));
  readonly canUploadDocuments = computed(() => this.authService.hasPermission('DOCUMENTO.SUBIR'));
  readonly canPublishDocuments = computed(() => this.authService.hasPermission('DOCUMENTO.PUBLICAR'));
  readonly canManageCatalogs = computed(() => this.authService.hasPermission('CATALOGO.GESTIONAR'));

  readonly pendingDocuments = computed(() =>
    this.documentos()
      .filter((documento) => (documento.estado ?? '') === 'Pendiente')
      .sort((left, right) => new Date(right.fechaSubida).getTime() - new Date(left.fechaSubida).getTime())
      .slice(0, 5)
  );

  readonly publishedDocuments = computed(() =>
    this.documentos()
      .filter((documento) => ['Publicado', 'Aprobado'].includes(documento.estado ?? ''))
      .sort((left, right) => new Date(right.fechaSubida).getTime() - new Date(left.fechaSubida).getTime())
      .slice(0, 5)
  );

  readonly summaryCards = computed<SummaryCard[]>(() => {
    const documentos = this.documentos();
    const pendientes = documentos.filter((documento) => (documento.estado ?? '') === 'Pendiente').length;
    const publicados = documentos.filter((documento) =>
      ['Publicado', 'Aprobado'].includes(documento.estado ?? '')
    ).length;
    const observados = documentos.filter((documento) => (documento.estado ?? '') === 'Observado').length;
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

    if (this.canPublishDocuments()) {
      cards.push({
        label: 'Observados',
        value: observados,
        description: 'Requieren correcciones antes de publicar',
        tone: 'warning',
        icon: 'RV'
      });
    }

    if (this.canManageCatalogs()) {
      cards.push({
        label: 'Catalogos activos',
        value: catalogosActivos,
        description: 'Tipos y facultades disponibles',
        tone: 'info',
        icon: 'CT'
      });
    } else if (this.canViewRepository()) {
      cards.push(
        {
          label: 'Tipos disponibles',
          value: tiposDisponibles,
          description: 'Clasificaciones visibles para consultar documentos',
          tone: 'info',
          icon: 'TD'
        },
        {
          label: 'Facultades registradas',
          value: facultadesDisponibles,
          description: 'Areas academicas usadas para organizar el repositorio',
          tone: 'warning',
          icon: 'FC'
        }
      );
    }

    return cards;
  });

  readonly quickActions = computed(() => {
    const allActions: QuickAction[] = [
      {
        title: 'Ver repositorio',
        description: 'Explorar documentos publicados y disponibles para consulta.',
        route: '/repositorio',
        permission: 'REPOSITORIO.VER',
        accent: 'blue',
        icon: 'RP'
      },
      {
        title: 'Subir documento',
        description: 'Registrar tesis, monografias, articulos o investigaciones.',
        route: '/subir-documento',
        permission: 'DOCUMENTO.SUBIR',
        accent: 'blue',
        icon: 'UP'
      },
      {
        title: 'Autorizar publicaciones',
        description: 'Revisar documentos enviados por docentes, autoridades o estudiantes.',
        route: '/revision-documental',
        permission: 'DOCUMENTO.PUBLICAR',
        accent: 'green',
        icon: 'RV'
      },
      {
        title: 'Gestionar catalogos',
        description: 'Crear y mantener tipos de documento y facultades activas.',
        route: '/tipos-documento',
        permission: 'CATALOGO.GESTIONAR',
        accent: 'purple',
        icon: 'CT'
      }
    ];

    return allActions.filter((action) => this.authService.hasPermission(action.permission));
  });

  readonly sidePanelTipos = computed(() => this.tiposDocumento().slice(0, 4));
  readonly sidePanelFacultades = computed(() => this.facultades().slice(0, 4));

  readonly recentActivity = computed(() =>
    this.documentos()
      .filter((documento) => {
        if (this.canPublishDocuments()) {
          return true;
        }

        return ['Publicado', 'Aprobado'].includes(documento.estado ?? '');
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
      case 'Aprobado':
        return `${autor} publico un documento en el repositorio.`;
      case 'Observado':
        return `${autor} tiene un documento observado para correccion.`;
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
