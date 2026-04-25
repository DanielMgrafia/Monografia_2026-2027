import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent {
  login = '';
  password = '';
  loading = false;
  error = '';

  readonly demoAccounts = [
    { label: 'Administrador', login: 'admin@universidad.edu', role: 'Acceso total' },
    { label: 'Profesor', login: 'profesor@universidad.edu', role: 'Sube y consulta' },
    { label: 'Estudiante', login: 'estudiante@universidad.edu', role: 'Consulta el repositorio' },
    { label: 'Decano', login: 'decano@universidad.edu', role: 'Revisa y publica' }
  ];

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  fillDemo(login: string): void {
    this.login = login;
    this.password = 'Acceso123*';
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
    }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/panel']);
      },
      error: () => {
        this.loading = false;
        this.error = 'No se pudo iniciar sesion. Verifica tus credenciales.';
      }
    });
  }
}
