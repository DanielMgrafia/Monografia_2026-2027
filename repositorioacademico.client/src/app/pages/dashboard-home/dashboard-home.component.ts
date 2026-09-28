import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { forkJoin, switchMap } from 'rxjs';
import { Catalogo } from '../../models/catalogo';
import { ConfiguracionInstitucion } from '../../models/configuracion-institucion';
import { Documento } from '../../models/documento';
import { AuthService } from '../../services/auth.service';
import { CatalogosService } from '../../services/catalogos.service';
import { DocumentosService } from '../../services/documentos.service';
import { InstitucionService } from '../../services/institucion.service';

interface PortalCard {
  title: string;
  description: string;
  icon: string;
  route?: string;
}

interface MetricCard {
  label: string;
  value: number;
  description: string;
}

interface TypeStat {
  id: number | string;
  label: string;
  count: number;
  percentage: number;
  initials: string;
}

interface ProcessStep {
  number: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.css']
})
export class DashboardHomeComponent implements OnInit {
  readonly loading = signal(true);
  readonly error = signal('');
  readonly documentos = signal<Documento[]>([]);
  readonly tiposDocumento = signal<Catalogo[]>([]);
  readonly configuracionInstitucion = signal<ConfiguracionInstitucion | null>(null);

  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  readonly authService = inject(AuthService);
  private readonly documentosService = inject(DocumentosService);
  private readonly catalogosService = inject(CatalogosService);
  private readonly institucionService = inject(InstitucionService);

  readonly processSteps: ProcessStep[] = [
    {
      number: '01',
      title: 'Seleccion de documentos',
      description: 'Recepcion de trabajos academicos y verificacion de datos iniciales.'
    },
    {
      number: '02',
      title: 'Analisis documental',
      description: 'Revision de metadatos, clasificacion, autores y contenido registrado.'
    },
    {
      number: '03',
      title: 'Publicacion en el portal',
      description: 'Aprobacion del documento para dejarlo disponible en el repositorio.'
    },
    {
      number: '04',
      title: 'Seguimiento academico',
      description: 'Consulta, descarga e historial para sostener la memoria institucional.'
    }
  ];

  readonly isAdministrator = computed(() =>
    this.authService
      .roles()
      .some((role) => role.nombre.trim().toLowerCase() === 'administrador')
  );
  readonly canViewRepository = computed(() => this.authService.hasPermission('REPOSITORIO.VER'));
  readonly canPublishDocuments = computed(() => this.authService.hasPermission('DOCUMENTO.PUBLICAR'));
  readonly canUploadDocuments = computed(() => this.authService.hasPermission('DOCUMENTO.SUBIR'));
  readonly canManageInstitution = computed(() => this.authService.hasPermission('INSTITUCION.PARAMETRIZAR'));

  readonly publishedDocuments = computed(() =>
    this.documentos()
      .filter((documento) => this.isPublished(documento))
      .sort((left, right) => new Date(right.fechaSubida).getTime() - new Date(left.fechaSubida).getTime())
  );

  readonly dashboardDocuments = computed(() =>
    this.canPublishDocuments() ? this.documentos() : this.publishedDocuments()
  );

  readonly pendingDocuments = computed(() =>
    this.documentos()
      .filter((documento) => (documento.estado ?? '') === 'Pendiente')
      .sort((left, right) => new Date(right.fechaSubida).getTime() - new Date(left.fechaSubida).getTime())
  );

  readonly recentDocuments = computed(() =>
    this.dashboardDocuments()
      .slice()
      .sort((left, right) => new Date(right.fechaSubida).getTime() - new Date(left.fechaSubida).getTime())
      .slice(0, 4)
  );

  readonly metricCards = computed<MetricCard[]>(() => {
    const cards: MetricCard[] = [
      {
        label: 'Documentos publicados',
        value: this.publishedDocuments().length,
        description: 'Disponibles para consulta institucional'
      },
      {
        label: 'Tipos de documento',
        value: this.tiposDocumento().length,
        description: 'Categorias activas del repositorio'
      }
    ];

    if (this.canPublishDocuments()) {
      cards.splice(1, 0, {
        label: 'Pendientes de revision',
        value: this.pendingDocuments().length,
        description: 'En espera de validacion documental'
      });
    }

    return cards;
  });

  readonly portalCards = computed<PortalCard[]>(() => {
    const cards: PortalCard[] = [
      {
        title: 'Novedades',
        description: 'Ultimas incorporaciones visibles en el repositorio academico.',
        icon: 'NV',
        route: this.canViewRepository() ? '/repositorio' : undefined
      },
      {
        title: 'Estadisticas',
        description: 'Resumen de documentos agrupados por tipo y estado.',
        icon: 'ST'
      }
    ];

    if (this.canUploadDocuments()) {
      cards.push({
        title: 'Autoarchivo',
        description: 'Registra tesis, monografias, articulos u otros documentos academicos.',
        icon: 'UP',
        route: '/subir-documento'
      });
    }

    if (this.canPublishDocuments()) {
      cards.push({
        title: 'Revision documental',
        description: 'Evalua solicitudes pendientes antes de publicarlas.',
        icon: 'RV',
        route: '/revision-documental'
      });
    }

    if (this.canManageInstitution()) {
      cards.push({
        title: 'Parametros',
        description: 'Actualiza nombre, logo, mision y vision institucional.',
        icon: 'IN',
        route: '/parametros-institucion'
      });
    }

    return cards.slice(0, 4);
  });

  readonly documentTypeStats = computed<TypeStat[]>(() => {
    const documentos = this.dashboardDocuments();
    const total = documentos.length;
    const stats = new Map<number | string, TypeStat>();

    for (const tipo of this.tiposDocumento()) {
      stats.set(tipo.id, {
        id: tipo.id,
        label: tipo.descripcion,
        count: 0,
        percentage: 0,
        initials: this.getInitials(tipo.descripcion)
      });
    }

    for (const documento of documentos) {
      const id = documento.tipoDocumentoId ?? documento.tipoDocumento ?? 'sin-tipo';
      const label = documento.tipoDocumento?.trim() || 'Sin tipo definido';
      const current = stats.get(id) ?? {
        id,
        label,
        count: 0,
        percentage: 0,
        initials: this.getInitials(label)
      };

      current.count += 1;
      current.label = current.label || label;
      stats.set(id, current);
    }

    const values = [...stats.values()]
      .map((stat) => ({
        ...stat,
        percentage: total > 0 ? Math.round((stat.count / total) * 100) : 0
      }))
      .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label));

    return total > 0 ? values.filter((stat) => stat.count > 0).slice(0, 8) : values.slice(0, 6);
  });

  ngOnInit(): void {
    this.loadDashboardData();
    this.loadInstitutionConfig();

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

  getInstitutionName(): string {
    return this.configuracionInstitucion()?.nombreInstitucion?.trim() || 'Repositorio Academico';
  }

  getInstitutionLogoUrl(): string | null {
    const logoUrl = this.configuracionInstitucion()?.logoUrl?.trim();
    return logoUrl ? logoUrl : null;
  }

  getMission(): string {
    return this.configuracionInstitucion()?.mision?.trim() ||
      'Facilitar el acceso, preservacion y difusion de la produccion academica institucional.';
  }

  getVision(): string {
    return this.configuracionInstitucion()?.vision?.trim() ||
      'Ser un punto de consulta confiable para investigadores, docentes y estudiantes.';
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

  getClasificacionPrincipal(documento: Documento): string {
    return documento.carrera ||
      documento.lineaInvestigacion ||
      documento.sublineaInvestigacion ||
      documento.tipoDocumento ||
      'Sin clasificacion';
  }

  getDocumentDate(documento: Documento): string {
    return new Intl.DateTimeFormat('es-NI', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(new Date(documento.fechaSubida));
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('es-NI').format(value);
  }

  isPublished(documento: Documento): boolean {
    return (documento.estado ?? '') === 'Publicado';
  }

  private loadDashboardData(): void {
    forkJoin({
      documentos: this.documentosService.getDocumentos(),
      tiposDocumento: this.catalogosService.getTiposDocumento()
    }).subscribe({
      next: ({ documentos, tiposDocumento }) => {
        this.documentos.set(documentos);
        this.tiposDocumento.set(tiposDocumento);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la informacion del panel.');
        this.loading.set(false);
      }
    });
  }

  private loadInstitutionConfig(): void {
    this.institucionService.getConfiguracion()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (configuracion) => this.configuracionInstitucion.set(configuracion),
        error: () => this.configuracionInstitucion.set(null)
      });
  }

  private getInitials(value: string): string {
    return value
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join('')
      .toUpperCase() || 'TD';
  }
}
