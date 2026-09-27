import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Rol, RolFlag } from '../../models/rol';
import { Usuario } from '../../models/usuario';
import { RolesService } from '../../services/roles.service';
import { CrearUsuarioPayload, UsuariosService } from '../../services/usuarios.service';

type RolConBanderas = Pick<Rol, 'id' | 'esEstudiante' | 'esDocente' | 'esAdministrador' | 'esCargoAcademico'>;

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
  restableciendoUsuarioId: number | null = null;
  mensaje = '';
  error = '';
  modalError = '';
  usuarioRolModal: Usuario | null = null;
  rolesModalSeleccionados: number[] = [];
  usuarioPasswordModal: Usuario | null = null;
  passwordTemporal = '';
  passwordTemporalExpiraEn = '';
  passwordCopiado = false;
  categoriaFlag: RolFlag = 'esEstudiante';
  categoriaSingular = 'estudiante';
  categoriaPlural = 'estudiantes';

  readonly nuevoUsuario: CrearUsuarioPayload = {
    nombres: '',
    apellidos: '',
    correo: '',
    carnet: '',
    password: '',
    rolIds: []
  };

  readonly rolesPorUsuario: Record<number, number[]> = {};

  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly usuariosService = inject(UsuariosService);
  private readonly rolesService = inject(RolesService);

  ngOnInit(): void {
    this.route.data
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => {
        this.categoriaFlag = this.normalizarBanderaRol(data['userRoleFlag']);
        this.categoriaSingular = this.normalizarTexto(data['userCategorySingular'], 'usuario');
        this.categoriaPlural = this.normalizarTexto(data['userCategoryPlural'], 'usuarios');
        this.limpiarFormulario();
        this.cerrarModalRoles(true);
        this.cargarDatos();
      });
  }

  cargarDatos(): void {
    this.cargando = true;
    this.error = '';
    this.usuarios = [];

    this.rolesService.getRoles().subscribe({
      next: (roles) => {
        this.roles = this.filtrarRolesPorCategoria(roles);
        this.nuevoUsuario.rolIds = this.nuevoUsuario.rolIds.filter((rolId) => this.esRolIdDeCategoria(rolId));
        this.cargarUsuarios();
      },
      error: () => {
        this.error = 'No se pudieron cargar los roles del sistema.';
        this.cargando = false;
      }
    });
  }

  cargarUsuarios(): void {
    this.usuariosService.getUsuarios(this.categoriaFlag).subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios;
        this.limpiarRolesPorUsuario();
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
        this.limpiarFormulario();
        this.guardando = false;
        this.mensaje = `${this.capitalizar(this.categoriaSingular)} creado correctamente.`;
      },
      error: (response) => {
        this.guardando = false;
        this.error = this.obtenerMensajeError(response, 'No se pudo crear el usuario.');
      }
    });
  }

  toggleNuevoRol(rolId: number, checked: boolean): void {
    this.nuevoUsuario.rolIds = checked
      ? [...new Set([...this.nuevoUsuario.rolIds, rolId])]
      : this.nuevoUsuario.rolIds.filter((item) => item !== rolId);
  }

  abrirModalRoles(usuario: Usuario): void {
    this.error = '';
    this.modalError = '';
    this.usuarioRolModal = usuario;
    this.rolesModalSeleccionados = [
      ...(this.rolesPorUsuario[usuario.id] ?? usuario.roles.map((rol) => rol.id))
    ].filter((rolId) => this.esRolIdDeCategoria(rolId));
  }

  cerrarModalRoles(forzar = false): void {
    if (!forzar && this.actualizandoUsuarioId !== null) {
      return;
    }

    this.usuarioRolModal = null;
    this.rolesModalSeleccionados = [];
    this.modalError = '';
  }

  isModalRoleSelected(rolId: number): boolean {
    return this.rolesModalSeleccionados.includes(rolId);
  }

  toggleModalRol(rolId: number, checked: boolean): void {
    this.rolesModalSeleccionados = checked
      ? [...new Set([...this.rolesModalSeleccionados, rolId])]
      : this.rolesModalSeleccionados.filter((item) => item !== rolId);
  }

  guardarRolesModal(): void {
    if (!this.usuarioRolModal) {
      return;
    }

    if (this.rolesModalSeleccionados.length === 0) {
      this.modalError = `Cada ${this.categoriaSingular} debe conservar al menos un rol de esta categoria.`;
      return;
    }

    const rolesOcultos = this.usuarioRolModal.roles
      .filter((rol) => !this.rolCoincideConCategoria(rol))
      .map((rol) => rol.id);
    const rolIds = [...new Set([...rolesOcultos, ...this.rolesModalSeleccionados])];

    this.actualizarRoles(this.usuarioRolModal, rolIds);
  }

  restablecerPassword(usuario: Usuario): void {
    this.restableciendoUsuarioId = usuario.id;
    this.mensaje = '';
    this.error = '';
    this.passwordCopiado = false;

    this.usuariosService.restablecerPassword(usuario.id).subscribe({
      next: (response) => {
        this.usuarios = this.usuarios.map((item) => item.id === response.usuario.id ? response.usuario : item);
        this.rolesPorUsuario[response.usuario.id] = response.usuario.roles.map((rol) => rol.id);
        this.usuarioPasswordModal = response.usuario;
        this.passwordTemporal = response.passwordTemporal;
        this.passwordTemporalExpiraEn = response.expiraEn;
        this.restableciendoUsuarioId = null;
      },
      error: (response) => {
        this.restableciendoUsuarioId = null;
        this.error = this.obtenerMensajeError(response, 'No se pudo restablecer la contrasena.');
      }
    });
  }

  cerrarModalPassword(): void {
    this.usuarioPasswordModal = null;
    this.passwordTemporal = '';
    this.passwordTemporalExpiraEn = '';
    this.passwordCopiado = false;
  }

  copiarPasswordTemporal(): void {
    if (!this.passwordTemporal || !navigator.clipboard) {
      return;
    }

    navigator.clipboard.writeText(this.passwordTemporal)
      .then(() => {
        this.passwordCopiado = true;
      })
      .catch(() => {
        this.passwordCopiado = false;
      });
  }

  formatearFecha(valor: string): string {
    if (!valor) {
      return 'Sin fecha';
    }

    return new Intl.DateTimeFormat('es-NI', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(valor));
  }

  private actualizarRoles(usuario: Usuario, rolIds: number[]): void {
    if (rolIds.length === 0) {
      this.modalError = `Cada ${this.categoriaSingular} debe conservar al menos un rol.`;
      return;
    }

    this.actualizandoUsuarioId = usuario.id;
    this.mensaje = '';
    this.error = '';
    this.modalError = '';

    this.usuariosService.actualizarRoles(usuario.id, { rolIds }).subscribe({
      next: (actualizado) => {
        this.usuarios = this.usuarios.map((item) => item.id === actualizado.id ? actualizado : item);
        this.rolesPorUsuario[usuario.id] = actualizado.roles.map((rol) => rol.id);
        this.actualizandoUsuarioId = null;
        this.usuarioRolModal = null;
        this.rolesModalSeleccionados = [];
        this.mensaje = `Roles actualizados para ${actualizado.nombres}.`;
      },
      error: (response) => {
        this.actualizandoUsuarioId = null;
        this.modalError = this.obtenerMensajeError(response, 'No se pudieron actualizar los roles.');
      }
    });
  }

  private obtenerMensajeError(response: unknown, mensajePorDefecto: string): string {
    const error = this.esRegistro(response) ? response['error'] : response;
    return this.convertirErrorATexto(error) ?? mensajePorDefecto;
  }

  private convertirErrorATexto(error: unknown): string | null {
    if (typeof error === 'string') {
      return error;
    }

    if (Array.isArray(error)) {
      const mensajes = error.filter((item): item is string => typeof item === 'string');
      return mensajes.length > 0 ? mensajes.join(' ') : null;
    }

    if (!this.esRegistro(error)) {
      return null;
    }

    const erroresModelo = this.convertirErroresModelo(error['errors']);
    if (erroresModelo) {
      return erroresModelo;
    }

    for (const clave of ['message', 'detail', 'title']) {
      const valor = error[clave];
      if (typeof valor === 'string' && valor.trim()) {
        return valor;
      }
    }

    return null;
  }

  private convertirErroresModelo(errors: unknown): string | null {
    if (!this.esRegistro(errors)) {
      return null;
    }

    const mensajes = Object.values(errors)
      .flatMap((valor) => Array.isArray(valor) ? valor : [valor])
      .filter((valor): valor is string => typeof valor === 'string' && valor.trim().length > 0);

    return mensajes.length > 0 ? mensajes.join(' ') : null;
  }

  private esRegistro(valor: unknown): valor is Record<string, unknown> {
    return typeof valor === 'object' && valor !== null;
  }

  private filtrarRolesPorCategoria(roles: Rol[]): Rol[] {
    return roles.filter((rol) => this.rolCoincideConCategoria(rol));
  }

  private esRolIdDeCategoria(rolId: number): boolean {
    return this.roles.some((rol) => rol.id === rolId);
  }

  private rolCoincideConCategoria(rol: RolConBanderas): boolean {
    return rol[this.categoriaFlag];
  }

  private limpiarFormulario(): void {
    this.nuevoUsuario.nombres = '';
    this.nuevoUsuario.apellidos = '';
    this.nuevoUsuario.correo = '';
    this.nuevoUsuario.carnet = '';
    this.nuevoUsuario.password = '';
    this.nuevoUsuario.rolIds = [];
  }

  private limpiarRolesPorUsuario(): void {
    for (const usuarioId of Object.keys(this.rolesPorUsuario)) {
      delete this.rolesPorUsuario[Number(usuarioId)];
    }
  }

  private normalizarBanderaRol(valor: unknown): RolFlag {
    return valor === 'esDocente' ||
      valor === 'esAdministrador' ||
      valor === 'esCargoAcademico' ||
      valor === 'esEstudiante'
      ? valor
      : 'esEstudiante';
  }

  private normalizarTexto(valor: unknown, respaldo: string): string {
    return typeof valor === 'string' && valor.trim() ? valor.trim() : respaldo;
  }

  private capitalizar(valor: string): string {
    return valor.length > 0 ? `${valor[0].toUpperCase()}${valor.slice(1)}` : valor;
  }
}
