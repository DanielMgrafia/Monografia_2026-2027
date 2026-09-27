import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-change-password-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './change-password-page.component.html',
  styleUrls: ['./change-password-page.component.css']
})
export class ChangePasswordPageComponent {
  passwordActual = '';
  nuevaPassword = '';
  confirmarPassword = '';
  loading = false;
  error = '';

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  cambiarPassword(): void {
    this.error = '';

    if (!this.passwordActual.trim() || !this.nuevaPassword.trim() || !this.confirmarPassword.trim()) {
      this.error = 'Completa todos los campos.';
      return;
    }

    if (this.nuevaPassword.length < 8) {
      this.error = 'La nueva contrasena debe tener al menos 8 caracteres.';
      return;
    }

    if (this.nuevaPassword !== this.confirmarPassword) {
      this.error = 'La confirmacion de la contrasena no coincide.';
      return;
    }

    this.loading = true;
    this.authService.cambiarPassword({
      passwordActual: this.passwordActual,
      nuevaPassword: this.nuevaPassword,
      confirmarPassword: this.confirmarPassword
    }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/panel']);
      },
      error: (response) => {
        this.loading = false;
        this.error = this.obtenerMensajeError(response) ?? 'No se pudo actualizar la contrasena.';
      }
    });
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  private obtenerMensajeError(response: unknown): string | null {
    if (typeof response === 'object' && response !== null && 'error' in response) {
      const error = (response as { error?: unknown }).error;
      return typeof error === 'string' && error.trim() ? error : null;
    }

    return null;
  }
}
