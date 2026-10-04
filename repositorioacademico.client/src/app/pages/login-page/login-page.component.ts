import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfiguracionInstitucion } from '../../models/configuracion-institucion';
import { AuthService } from '../../services/auth.service';
import { InstitucionService } from '../../services/institucion.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent implements OnInit {
  configuracion: ConfiguracionInstitucion | null = null;
  login = '';
  password = '';
  remember = false;
  showPassword = false;
  loading = false;
  error = '';

  private readonly authService = inject(AuthService);
  private readonly institucionService = inject(InstitucionService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.institucionService.getConfiguracion().subscribe({
      next: (configuracion) => {
        this.configuracion = configuracion;
      }
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  clearError(): void {
    this.error = '';
  }

  getLogoUrl(): string | null {
    return this.configuracion?.logoUrl ?? null;
  }

  getNombreInstitucion(): string {
    return this.configuracion?.nombreInstitucion?.trim() || 'Repositorio Academico';
  }

  submit(): void {
    this.error = '';

    if (!this.login.trim() || !this.password.trim()) {
      this.error = 'Ingresa tu correo o carnet y la contrasena.';
      return;
    }

    this.loading = true;
    this.authService.login({
      login: this.login.trim(),
      password: this.password
    }, this.remember).subscribe({
      next: (response) => {
        this.loading = false;
        this.router.navigate([response.usuario.debeCambiarPassword ? '/cambiar-password' : '/panel']);
      },
      error: (response) => {
        this.loading = false;
        this.error = this.obtenerMensajeError(response) ?? 'No se pudo iniciar sesion. Verifica tus credenciales.';
      }
    });
  }

  private obtenerMensajeError(response: unknown): string | null {
    if (typeof response === 'object' && response !== null && 'error' in response) {
      const error = (response as { error?: unknown }).error;
      return typeof error === 'string' && error.trim() ? error : null;
    }

    return null;
  }
}
