import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Rol } from '../../models/rol';
import { RolesService } from '../../services/roles.service';

type EstadoRol = 'Activo' | 'Inactivo';

interface RolForm {
  nombre: string;
  descripcion: string;
  estado: EstadoRol;
}

@Component({
  selector: 'app-role-catalog-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './role-catalog-page.component.html',
  styleUrls: ['./role-catalog-page.component.css']
})
export class RoleCatalogPageComponent implements OnInit {
  roles: Rol[] = [];
  rolEnEdicion: Rol | null = null;

  nuevoRol: RolForm = this.crearFormulario('Activo');
  editModel: RolForm = this.crearFormulario('Activo');

  cargando = false;
  guardando = false;
  procesandoRolId: number | null = null;
  mensaje = '';
  error = '';

  private readonly rolesService = inject(RolesService);

  ngOnInit(): void {
    this.cargarRoles();
  }

  cargarRoles(): void {
    this.cargando = true;
    this.error = '';

    this.rolesService.getRoles(true).subscribe({
      next: (roles) => {
        this.roles = this.ordenarRoles(roles);
        this.cargando = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar los roles.';
        this.cargando = false;
      }
    });
  }

  guardarRol(): void {
    this.mensaje = '';
    this.error = '';

    const nombre = this.nuevoRol.nombre.trim();
    if (!nombre) {
      this.error = 'Ingresa el nombre del rol.';
      return;
    }

    this.guardando = true;

    this.rolesService.crearRol({
      nombre,
      descripcion: this.nuevoRol.descripcion.trim(),
      estado: this.nuevoRol.estado,
      permisoIds: []
    }).subscribe({
      next: (rol) => {
        this.roles = this.ordenarRoles([...this.roles, rol]);
        this.nuevoRol = this.crearFormulario('Activo');
        this.guardando = false;
        this.mensaje = 'Rol creado correctamente.';
      },
      error: (response) => {
        this.guardando = false;
        this.error = response.error || 'No se pudo crear el rol.';
      }
    });
  }

  abrirEdicion(rol: Rol): void {
    this.mensaje = '';
    this.error = '';
    this.rolEnEdicion = rol;
    this.editModel = {
      nombre: rol.nombre,
      descripcion: rol.descripcion ?? '',
      estado: this.normalizarEstado(rol.estado)
    };
  }

  cancelarEdicion(): void {
    this.rolEnEdicion = null;
    this.editModel = this.crearFormulario('Activo');
  }

  guardarEdicion(): void {
    if (!this.rolEnEdicion) {
      return;
    }

    const nombre = this.editModel.nombre.trim();
    if (!nombre) {
      this.error = 'Ingresa el nombre del rol.';
      return;
    }

    this.procesandoRolId = this.rolEnEdicion.id;
    this.mensaje = '';
    this.error = '';

    this.rolesService.actualizarRol(this.rolEnEdicion.id, {
      nombre,
      descripcion: this.editModel.descripcion.trim(),
      estado: this.editModel.estado
    }).subscribe({
      next: (actualizado) => {
        this.reemplazarRol(actualizado);
        this.procesandoRolId = null;
        this.cancelarEdicion();
        this.mensaje = `Rol ${actualizado.nombre} actualizado correctamente.`;
      },
      error: (response) => {
        this.procesandoRolId = null;
        this.error = response.error || 'No se pudo actualizar el rol.';
      }
    });
  }

  cambiarEstado(rol: Rol): void {
    const nuevoEstado: EstadoRol = this.normalizarEstado(rol.estado) === 'Activo' ? 'Inactivo' : 'Activo';
    this.procesandoRolId = rol.id;
    this.mensaje = '';
    this.error = '';

    this.rolesService.actualizarEstado(rol.id, nuevoEstado).subscribe({
      next: (actualizado) => {
        this.reemplazarRol(actualizado);
        this.procesandoRolId = null;
        this.mensaje = `Rol ${actualizado.nombre} ${nuevoEstado === 'Activo' ? 'activado' : 'desactivado'}.`;
      },
      error: (response) => {
        this.procesandoRolId = null;
        this.error = response.error || 'No se pudo actualizar el estado del rol.';
      }
    });
  }

  getEstadoClass(estado?: string): string {
    return this.normalizarEstado(estado) === 'Activo' ? 'active' : 'inactive';
  }

  getToggleLabel(rol: Rol): string {
    return this.normalizarEstado(rol.estado) === 'Activo' ? 'Desactivar' : 'Activar';
  }

  private reemplazarRol(actualizado: Rol): void {
    this.roles = this.ordenarRoles(
      this.roles.map((rol) => rol.id === actualizado.id ? actualizado : rol)
    );
  }

  private ordenarRoles(roles: Rol[]): Rol[] {
    return [...roles].sort((left, right) =>
      left.nombre.localeCompare(right.nombre, 'es', { sensitivity: 'base' })
    );
  }

  private normalizarEstado(estado?: string): EstadoRol {
    return estado === 'Inactivo' ? 'Inactivo' : 'Activo';
  }

  private crearFormulario(estado: EstadoRol): RolForm {
    return {
      nombre: '',
      descripcion: '',
      estado
    };
  }
}
