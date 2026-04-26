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

  readonly pendingDocuments = computed(() =>
    this.documentos()
      .filter((documento) => (documento.estado ?? '') === 'Pendiente')
      .sort((left, right) => new Date(right.fechaSubida).getTime() - new Date(left.fechaSubida).getTime())
      .slice(0, 5)
  );

  readonly summary = computed(() => {
    const documentos = this.documentos();
    const pendientes = documentos.filter((documento) => (documento.estado ?? '') === 'Pendiente').length;
    const publicados = documentos.filter((documento) =>
      ['Publicado', 'Aprobado'].includes(documento.estado ?? '')
    ).length;
    const observados = documentos.filter((documento) => (documento.estado ?? '') === 'Observado').length;
    const catalogosActivos = this.tiposDocumento().length + this.facultades().length;

    return { pendientes, publicados, observados, catalogosActivos };
  });

  readonly quickActions = computed(() => {
    const allActions: QuickAction[] = [
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

  readonly recentActivity = computed(() =>
    this.documentos()
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
