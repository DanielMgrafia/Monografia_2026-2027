import { CommonModule } from '@angular/common';
import { Component, DestroyRef, HostListener, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import {
  LucideBookUser,
  LucideBriefcaseBusiness,
  LucideChevronDown,
  LucideChevronRight,
  LucideClipboardCheck,
  LucideFilePenLine,
  LucideFileText,
  LucideFileUp,
  LucideFolderCog,
  LucideGitBranch,
  LucideGitFork,
  LucideGraduationCap,
  LucideHistory,
  type LucideIcon,
  LucideLayoutDashboard,
  LucideLibraryBig,
  LucideRoute,
  LucideSchool,
  LucideShieldCheck,
  LucideShapes,
  LucideUniversity,
  LucideUserCog,
  LucideUsersRound,
  LucideDynamicIcon
} from '@lucide/angular';
import { filter, merge, of, switchMap } from 'rxjs';
import { ConfiguracionInstitucion } from '../../models/configuracion-institucion';
import { AuthService } from '../../services/auth.service';
import { DocumentosService } from '../../services/documentos.service';
import { InstitucionService } from '../../services/institucion.service';

interface MenuItem {
  label: string;
  route: string;
  permission?: string;
  icon: LucideIcon;
  badge?: number;
}

interface ProfileField {
  label: string;
  value: string;
}

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, LucideDynamicIcon],
  templateUrl: './dashboard-layout.component.html',
  styleUrls: ['./dashboard-layout.component.css']
})
export class DashboardLayoutComponent implements OnInit {
  private static readonly MOBILE_BREAKPOINT = 980;
  private static readonly SIDEBAR_STORAGE_KEY = 'repositorio-dashboard-sidebar-collapsed';

  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly documentosService = inject(DocumentosService);
  private readonly institucionService = inject(InstitucionService);

  readonly currentUser = this.authService.currentUser;
  readonly configuracionInstitucion = signal<ConfiguracionInstitucion | null>(null);
  readonly isMobileViewport = signal(this.readIsMobileViewport());
  readonly mobileMenuOpen = signal(false);
  readonly sidebarCollapsed = signal(this.readSidebarState());
  readonly usersMenuOpen = signal(false);
  readonly catalogMenuOpen = signal(false);
  readonly accountMenuOpen = signal(false);
  readonly profileDetailsOpen = signal(false);
  readonly pendingCount = signal(0);
  readonly pageTitle = signal('Panel administrativo');
  readonly pageDescription = signal('Gestion centralizada del repositorio academico.');
  readonly usersGroupIcon = LucideUsersRound;
  readonly catalogGroupIcon = LucideFolderCog;
  readonly chevronDownIcon = LucideChevronDown;
  readonly chevronRightIcon = LucideChevronRight;

  readonly menuItems = computed<MenuItem[]>(() => {
    const items: MenuItem[] = [
      { label: 'Panel principal', route: '/panel', icon: LucideLayoutDashboard },
      {
        label: 'Revision documental',
        route: '/revision-documental',
        permission: 'DOCUMENTO.PUBLICAR',
        icon: LucideClipboardCheck,
        badge: this.pendingCount()
      },
      {
        label: 'Edicion documental',
        route: '/edicion-documental',
        permission: 'DOCUMENTO.PUBLICAR',
        icon: LucideFilePenLine
      },
      { label: 'Repositorio', route: '/repositorio', permission: 'REPOSITORIO.VER', icon: LucideLibraryBig },
      { label: 'Mi historial', route: '/historial-biblioteca', permission: 'REPOSITORIO.VER', icon: LucideHistory },
      { label: 'Subir documentos', route: '/subir-documento', permission: 'DOCUMENTO.SUBIR', icon: LucideFileUp },
      { label: 'Roles y permisos', route: '/roles', permission: 'ROL.GESTIONAR', icon: LucideShieldCheck }
    ];

    return items.filter((item) => {
      if (!item.permission) {
        return true;
      }

      return this.authService.hasPermission(item.permission);
    });
  });

  readonly userItems = computed<MenuItem[]>(() => {
    const items: MenuItem[] = [
      {
        label: 'Estudiantes',
        route: '/usuarios/estudiantes',
        permission: 'USUARIO.GESTIONAR',
        icon: LucideGraduationCap
      },
      { label: 'Docentes', route: '/usuarios/docentes', permission: 'USUARIO.GESTIONAR', icon: LucideBookUser },
      {
        label: 'Administradores',
        route: '/usuarios/administradores',
        permission: 'USUARIO.GESTIONAR',
        icon: LucideUserCog
      },
      {
        label: 'Cargos academicos',
        route: '/usuarios/cargos-academicos',
        permission: 'USUARIO.GESTIONAR',
        icon: LucideBriefcaseBusiness
      }
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
      { label: 'Tipos de documento', route: '/tipos-documento', permission: 'CATALOGO.GESTIONAR', icon: LucideFileText },
      { label: 'Areas de conocimiento', route: '/areas-conocimiento', permission: 'CATALOGO.GESTIONAR', icon: LucideShapes },
      {
        label: 'Lineas de investigacion',
        route: '/lineas-investigacion',
        permission: 'CATALOGO.GESTIONAR',
        icon: LucideGitBranch
      },
      {
        label: 'Sublineas de investigacion',
        route: '/sublineas-investigacion',
        permission: 'CATALOGO.GESTIONAR',
        icon: LucideGitFork
      },
      { label: 'Carreras', route: '/carreras', permission: 'CATALOGO.GESTIONAR', icon: LucideSchool },
      {
        label: 'Lineas por carrera',
        route: '/carrera-lineas-investigacion',
        permission: 'CATALOGO.GESTIONAR',
        icon: LucideRoute
      },
      { label: 'Roles', route: '/catalogo-roles', permission: 'ROL.GESTIONAR', icon: LucideShieldCheck },
      {
        label: 'Institucion',
        route: '/parametros-institucion',
        permission: 'INSTITUCION.PARAMETRIZAR',
        icon: LucideUniversity
      }
    ];

    return items.filter((item) => {
      if (!item.permission) {
        return true;
      }

      return this.authService.hasPermission(item.permission);
    });
  });

  readonly profileFields = computed<ProfileField[]>(() => {
    const user = this.currentUser();
    if (!user) {
      return [];
    }

    return [
      { label: 'Correo', value: user.correo },
      { label: 'Carnet', value: user.carnet },
      {
        label: 'Roles',
        value: user.roles.length > 0 ? user.roles.map((role) => role.nombre).join(', ') : 'Sin roles asignados'
      }
    ];
  });

  ngOnInit(): void {
    this.cargarConfiguracionInstitucion();
    this.syncPageMetadata();
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.syncPageMetadata();
        this.closeMobileMenu();
        this.closeAccountMenu();
      });

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
    if (this.isMobileViewport()) {
      this.mobileMenuOpen.set(!this.mobileMenuOpen());
      return;
    }

    const collapsed = !this.sidebarCollapsed();
    this.sidebarCollapsed.set(collapsed);
    if (collapsed) {
      this.usersMenuOpen.set(false);
      this.catalogMenuOpen.set(false);
    }
    localStorage.setItem(DashboardLayoutComponent.SIDEBAR_STORAGE_KEY, String(collapsed));
  }

  toggleUsersMenu(): void {
    if (!this.isMobileViewport() && this.sidebarCollapsed()) {
      this.sidebarCollapsed.set(false);
      localStorage.setItem(DashboardLayoutComponent.SIDEBAR_STORAGE_KEY, 'false');
    }

    this.usersMenuOpen.set(!this.usersMenuOpen());
  }

  toggleCatalogMenu(): void {
    if (!this.isMobileViewport() && this.sidebarCollapsed()) {
      this.sidebarCollapsed.set(false);
      localStorage.setItem(DashboardLayoutComponent.SIDEBAR_STORAGE_KEY, 'false');
    }

    this.catalogMenuOpen.set(!this.catalogMenuOpen());
  }

  logout(): void {
    this.closeAccountMenu();
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

  getRoleIconUrl(): string | null {
    const roles = this.currentUser()?.roles ?? [];
    return roles.find((role) => !!role.iconoUrl)?.iconoUrl ?? null;
  }

  getInstitutionLogoUrl(): string | null {
    const logoUrl = this.configuracionInstitucion()?.logoUrl?.trim();
    return logoUrl ? logoUrl : null;
  }

  getInstitutionName(): string {
    const nombreInstitucion = this.configuracionInstitucion()?.nombreInstitucion?.trim();
    return nombreInstitucion || 'Repositorio';
  }

  getInstitutionSubtitle(): string {
    return this.configuracionInstitucion()?.nombreInstitucion?.trim() ? 'Repositorio academico' : 'Dashboard';
  }

  isCatalogRouteActive(): boolean {
    return this.router.url.startsWith('/tipos-documento') ||
      this.router.url.startsWith('/areas-conocimiento') ||
      this.router.url.startsWith('/lineas-investigacion') ||
      this.router.url.startsWith('/sublineas-investigacion') ||
      this.router.url.startsWith('/carreras') ||
      this.router.url.startsWith('/carrera-lineas-investigacion') ||
      this.router.url.startsWith('/catalogo-roles') ||
      this.router.url.startsWith('/parametros-institucion');
  }

  isUsersRouteActive(): boolean {
    return this.router.url.startsWith('/usuarios');
  }

  handleNavigationSelection(): void {
    this.closeMobileMenu();
    this.closeAccountMenu();
  }

  toggleAccountMenu(): void {
    const nextState = !this.accountMenuOpen();
    this.accountMenuOpen.set(nextState);

    if (!nextState) {
      this.profileDetailsOpen.set(false);
    }
  }

  closeAccountMenu(): void {
    this.accountMenuOpen.set(false);
    this.profileDetailsOpen.set(false);
  }

  toggleProfileDetails(): void {
    this.profileDetailsOpen.set(!this.profileDetailsOpen());
  }

  getPrimaryRoleLabel(): string {
    const roles = this.currentUser()?.roles ?? [];
    return roles.length > 0 ? roles[0].nombre : 'Usuario';
  }

  getSecondaryRoleLabel(): string {
    const roles = this.currentUser()?.roles ?? [];
    if (roles.length <= 1) {
      return this.currentUser()?.correo ?? '';
    }

    const secondaryRoles = roles
      .slice(1)
      .map((role) => role.nombre)
      .join(', ');

    return `${secondaryRoles} · ${this.currentUser()?.correo ?? ''}`;
  }

  getSidebarToggleLabel(): string {
    if (this.isMobileViewport()) {
      return this.mobileMenuOpen() ? 'X' : 'MENU';
    }

    return this.sidebarCollapsed() ? '>>' : '<<';
  }

  getSidebarToggleAriaLabel(): string {
    if (this.isMobileViewport()) {
      return this.mobileMenuOpen() ? 'Ocultar panel lateral' : 'Mostrar panel lateral';
    }

    return this.sidebarCollapsed() ? 'Mostrar menu lateral' : 'Ocultar menu lateral';
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.syncViewportState();
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

  private cargarConfiguracionInstitucion(): void {
    this.institucionService.getConfiguracion()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (configuracion) => this.configuracionInstitucion.set(configuracion),
        error: () => this.configuracionInstitucion.set(null)
      });
  }

  private readSidebarState(): boolean {
    const storedValue = localStorage.getItem(DashboardLayoutComponent.SIDEBAR_STORAGE_KEY);
    return storedValue === 'true';
  }

  private closeMobileMenu(): void {
    if (this.isMobileViewport()) {
      this.mobileMenuOpen.set(false);
    }
  }

  private syncViewportState(): void {
    const isMobile = this.readIsMobileViewport();
    const wasMobile = this.isMobileViewport();

    this.isMobileViewport.set(isMobile);

    if (isMobile && !wasMobile) {
      this.mobileMenuOpen.set(false);
    }

    if (!isMobile && wasMobile) {
      this.mobileMenuOpen.set(false);
    }

    this.closeAccountMenu();
  }

  private readIsMobileViewport(): boolean {
    return window.innerWidth <= DashboardLayoutComponent.MOBILE_BREAKPOINT;
  }
}
