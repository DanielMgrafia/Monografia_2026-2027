import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, merge, of, switchMap } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { DocumentosService } from '../../services/documentos.service';

interface MenuItem {
  label: string;
  route: string;
  permission?: string;
  icon: string;
  badge?: number;
}

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './dashboard-layout.component.html',
  styleUrls: ['./dashboard-layout.component.css']
})
export class DashboardLayoutComponent implements OnInit {
  private static readonly SIDEBAR_STORAGE_KEY = 'repositorio-dashboard-sidebar-collapsed';

  search = '';

  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly documentosService = inject(DocumentosService);

  readonly currentUser = this.authService.currentUser;
  readonly sidebarCollapsed = signal(this.readSidebarState());
  readonly catalogMenuOpen = signal(true);
  readonly pendingCount = signal(0);
  readonly pageTitle = signal('Panel administrativo');
  readonly pageDescription = signal('Gestion centralizada del repositorio academico.');

  readonly menuItems = computed<MenuItem[]>(() => {
    const items: MenuItem[] = [
      { label: 'Panel principal', route: '/panel', icon: 'DB' },
      {
        label: 'Revision documental',
        route: '/revision-documental',
        permission: 'DOCUMENTO.PUBLICAR',
        icon: 'RV',
        badge: this.pendingCount()
      },
      {
        label: 'Edicion documental',
        route: '/edicion-documental',
        permission: 'DOCUMENTO.PUBLICAR',
        icon: 'ED'
      },
      { label: 'Repositorio', route: '/repositorio', permission: 'REPOSITORIO.VER', icon: 'RP' },
      { label: 'Subir documentos', route: '/subir-documento', permission: 'DOCUMENTO.SUBIR', icon: 'UP' },
      { label: 'Usuarios', route: '/usuarios', permission: 'USUARIO.GESTIONAR', icon: 'US' },
      { label: 'Roles y permisos', route: '/roles', permission: 'ROL.GESTIONAR', icon: 'RL' }
    ];

    return items.filter((item) => {
      if (!item.permission) {
        return true;
      }

      return this.authService.hasPermission(item.permission);
    });
  });

  readonly catalogItems = computed<MenuItem[]>(() => {
    const items: MenuItem[] = [
      { label: 'Tipos de documento', route: '/tipos-documento', permission: 'CATALOGO.GESTIONAR', icon: 'TD' },
      { label: 'Facultades', route: '/facultades', permission: 'CATALOGO.GESTIONAR', icon: 'FC' }
    ];

    return items.filter((item) => {
      if (!item.permission) {
        return true;
      }

      return this.authService.hasPermission(item.permission);
    });
  });

  ngOnInit(): void {
    this.syncPageMetadata();
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => this.syncPageMetadata());

    if (this.authService.hasPermission('DOCUMENTO.PUBLICAR')) {
      merge(of(void 0), this.documentosService.documentosActualizados$)
        .pipe(
          switchMap(() => this.documentosService.getDocumentos()),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe({
          next: (documentos) => {
            this.pendingCount.set(
              documentos.filter((documento) => (documento.estado ?? '') === 'Pendiente').length
            );
          }
        });
    }
  }

  toggleSidebar(): void {
    const collapsed = !this.sidebarCollapsed();
    this.sidebarCollapsed.set(collapsed);
    if (collapsed) {
      this.catalogMenuOpen.set(false);
    }
    localStorage.setItem(DashboardLayoutComponent.SIDEBAR_STORAGE_KEY, String(collapsed));
  }

  toggleCatalogMenu(): void {
    if (this.sidebarCollapsed()) {
      this.sidebarCollapsed.set(false);
      localStorage.setItem(DashboardLayoutComponent.SIDEBAR_STORAGE_KEY, 'false');
    }

    this.catalogMenuOpen.set(!this.catalogMenuOpen());
  }

  submitSearch(): void {
    const query = this.search.trim();
    this.router.navigate(['/repositorio'], {
      queryParams: {
        q: query || null
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getInitials(): string {
    const user = this.currentUser();
    if (!user) {
      return 'NA';
    }

    return `${user.nombres[0] ?? ''}${user.apellidos[0] ?? ''}`.toUpperCase();
  }

  getPrimaryActionRoute(): string {
    if (this.authService.hasPermission('DOCUMENTO.SUBIR')) {
      return '/subir-documento';
    }

    if (this.authService.hasPermission('DOCUMENTO.PUBLICAR')) {
      return '/revision-documental';
    }

    return '/repositorio';
  }

  getPrimaryActionLabel(): string {
    if (this.authService.hasPermission('DOCUMENTO.SUBIR')) {
      return 'Nuevo documento';
    }

    if (this.authService.hasPermission('DOCUMENTO.PUBLICAR')) {
      return 'Revisar pendientes';
    }

    return 'Ver repositorio';
  }

  isCatalogRouteActive(): boolean {
    return this.router.url.startsWith('/tipos-documento') || this.router.url.startsWith('/facultades');
  }

  private syncPageMetadata(): void {
    let route: ActivatedRoute | null = this.activatedRoute;

    while (route?.firstChild) {
      route = route.firstChild;
    }

    this.pageTitle.set(route?.snapshot.data['title'] ?? 'Panel administrativo');
    this.pageDescription.set(
      route?.snapshot.data['description'] ?? 'Gestion centralizada del repositorio academico.'
    );
  }

  private readSidebarState(): boolean {
    const storedValue = localStorage.getItem(DashboardLayoutComponent.SIDEBAR_STORAGE_KEY);
    return storedValue === 'true';
  }
}
