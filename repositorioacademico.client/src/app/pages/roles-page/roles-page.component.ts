import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Permiso, Rol } from '../../models/rol';
import { PermisosService } from '../../services/permisos.service';
import { RolesService } from '../../services/roles.service';

@Component({
  selector: 'app-roles-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './roles-page.component.html',
  styleUrls: ['./roles-page.component.css']
})
export class RolesPageComponent implements OnInit {
  private static readonly HIDDEN_PERMISSION_CODES = new Set(['DASHBOARD.VER']);

  roles: Rol[] = [];
  permisos: Permiso[] = [];

  cargando = false;
  actualizandoRolId: number | null = null;
  mensaje = '';
  error = '';

  readonly permisosPorRol: Record<number, number[]> = {};

  private readonly rolesService = inject(RolesService);
  private readonly permisosService = inject(PermisosService);

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;
    this.error = '';

    this.permisosService.getPermisos().subscribe({
      next: (permisos) => {
        this.permisos = permisos.filter((permiso) => !RolesPageComponent.HIDDEN_PERMISSION_CODES.has(permiso.codigo));
        this.cargarRoles();
      },
      error: () => {
        this.error = 'No se pudieron cargar los permisos del sistema.';
        this.cargando = false;
      }
    });
  }

  cargarRoles(): void {
    this.rolesService.getRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
        for (const rol of roles) {
          this.permisosPorRol[rol.id] = rol.permisos.map((permiso) => permiso.id);
        }
        this.cargando = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar los roles.';
        this.cargando = false;
      }
    });
  }

  togglePermisoRol(rolId: number, permisoId: number, checked: boolean): void {
    const actuales = this.permisosPorRol[rolId] ?? [];
    this.permisosPorRol[rolId] = checked
      ? [...new Set([...actuales, permisoId])]
      : actuales.filter((item) => item !== permisoId);
  }

  actualizarPermisos(rol: Rol): void {
    const permisoIds = this.permisosPorRol[rol.id] ?? [];
    if (permisoIds.length === 0) {
      this.error = 'Cada rol debe conservar al menos un permiso.';
      return;
    }

    this.actualizandoRolId = rol.id;
    this.mensaje = '';
    this.error = '';

    this.rolesService.actualizarPermisos(rol.id, { permisoIds }).subscribe({
      next: (actualizado) => {
        this.roles = this.roles.map((item) => item.id === actualizado.id ? actualizado : item);
        this.permisosPorRol[rol.id] = actualizado.permisos.map((permiso) => permiso.id);
        this.actualizandoRolId = null;
        this.mensaje = `Permisos actualizados para el rol ${actualizado.nombre}.`;
      },
      error: (response) => {
        this.actualizandoRolId = null;
        this.error = response.error || 'No se pudieron actualizar los permisos.';
      }
    });
  }

  hasPermissionSelected(rolId: number, permisoId: number): boolean {
    return (this.permisosPorRol[rolId] ?? []).includes(permisoId);
  }
}
