import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Rol } from '../../models/rol';
import { Usuario } from '../../models/usuario';
import { RolesService } from '../../services/roles.service';
import { CrearUsuarioPayload, UsuariosService } from '../../services/usuarios.service';

@Component({
  selector: 'app-users-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users-page.component.html',
  styleUrls: ['./users-page.component.css']
})
export class UsersPageComponent implements OnInit {
  usuarios: Usuario[] = [];
  roles: Rol[] = [];

  cargando = false;
  guardando = false;
  actualizandoUsuarioId: number | null = null;
  mensaje = '';
  error = '';

  readonly nuevoUsuario: CrearUsuarioPayload = {
    nombres: '',
    apellidos: '',
    correo: '',
    carnet: '',
    password: '',
    rolIds: []
  };

  readonly rolesPorUsuario: Record<number, number[]> = {};

  private readonly usuariosService = inject(UsuariosService);
  private readonly rolesService = inject(RolesService);

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;
    this.error = '';

    this.rolesService.getRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
        this.cargarUsuarios();
      },
      error: () => {
        this.error = 'No se pudieron cargar los roles del sistema.';
        this.cargando = false;
      }
    });
  }

  cargarUsuarios(): void {
    this.usuariosService.getUsuarios().subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios;
        for (const usuario of usuarios) {
          this.rolesPorUsuario[usuario.id] = usuario.roles.map((rol) => rol.id);
        }
        this.cargando = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar los usuarios.';
        this.cargando = false;
      }
    });
  }

  guardarUsuario(): void {
    this.mensaje = '';
    this.error = '';

    if (
      !this.nuevoUsuario.nombres.trim() ||
      !this.nuevoUsuario.apellidos.trim() ||
      !this.nuevoUsuario.correo.trim() ||
      !this.nuevoUsuario.carnet.trim() ||
      !this.nuevoUsuario.password.trim() ||
      this.nuevoUsuario.rolIds.length === 0
    ) {
      this.error = 'Completa todos los campos y asigna al menos un rol.';
      return;
    }

    this.guardando = true;

    this.usuariosService.crearUsuario({
      ...this.nuevoUsuario,
      nombres: this.nuevoUsuario.nombres.trim(),
      apellidos: this.nuevoUsuario.apellidos.trim(),
      correo: this.nuevoUsuario.correo.trim(),
      carnet: this.nuevoUsuario.carnet.trim()
    }).subscribe({
      next: (usuario) => {
        this.usuarios = [...this.usuarios, usuario].sort((left, right) =>
          `${left.nombres} ${left.apellidos}`.localeCompare(`${right.nombres} ${right.apellidos}`, 'es', { sensitivity: 'base' })
        );
        this.rolesPorUsuario[usuario.id] = usuario.roles.map((rol) => rol.id);
        this.nuevoUsuario.nombres = '';
        this.nuevoUsuario.apellidos = '';
        this.nuevoUsuario.correo = '';
        this.nuevoUsuario.carnet = '';
        this.nuevoUsuario.password = '';
        this.nuevoUsuario.rolIds = [];
        this.guardando = false;
        this.mensaje = 'Usuario creado correctamente.';
      },
      error: (response) => {
        this.guardando = false;
        this.error = response.error || 'No se pudo crear el usuario.';
      }
    });
  }

  toggleNuevoRol(rolId: number, checked: boolean): void {
    this.nuevoUsuario.rolIds = checked
      ? [...new Set([...this.nuevoUsuario.rolIds, rolId])]
      : this.nuevoUsuario.rolIds.filter((item) => item !== rolId);
  }

  toggleRolUsuario(usuarioId: number, rolId: number, checked: boolean): void {
    const actuales = this.rolesPorUsuario[usuarioId] ?? [];
    this.rolesPorUsuario[usuarioId] = checked
      ? [...new Set([...actuales, rolId])]
      : actuales.filter((item) => item !== rolId);
  }

  actualizarRoles(usuario: Usuario): void {
    const rolIds = this.rolesPorUsuario[usuario.id] ?? [];
    if (rolIds.length === 0) {
      this.error = 'Cada usuario debe conservar al menos un rol.';
      return;
    }

    this.actualizandoUsuarioId = usuario.id;
    this.mensaje = '';
    this.error = '';

    this.usuariosService.actualizarRoles(usuario.id, { rolIds }).subscribe({
      next: (actualizado) => {
        this.usuarios = this.usuarios.map((item) => item.id === actualizado.id ? actualizado : item);
        this.rolesPorUsuario[usuario.id] = actualizado.roles.map((rol) => rol.id);
        this.actualizandoUsuarioId = null;
        this.mensaje = `Roles actualizados para ${actualizado.nombres}.`;
      },
      error: (response) => {
        this.actualizandoUsuarioId = null;
        this.error = response.error || 'No se pudieron actualizar los roles.';
      }
    });
  }

  hasRoleSelected(usuarioId: number, rolId: number): boolean {
    return (this.rolesPorUsuario[usuarioId] ?? []).includes(rolId);
  }
}
