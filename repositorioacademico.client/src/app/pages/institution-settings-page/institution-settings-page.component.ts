import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfiguracionInstitucion } from '../../models/configuracion-institucion';
import { InstitucionService } from '../../services/institucion.service';

interface InstitucionForm {
  nombreInstitucion: string;
  logoUrl: string | null;
  mision: string;
  vision: string;
}

@Component({
  selector: 'app-institution-settings-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './institution-settings-page.component.html',
  styleUrls: ['./institution-settings-page.component.css']
})
export class InstitutionSettingsPageComponent implements OnInit {
  private static readonly MAX_LOGO_SIZE_BYTES = 150 * 1024;
  private static readonly ALLOWED_LOGO_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);

  configuracion: ConfiguracionInstitucion | null = null;
  form: InstitucionForm = this.crearFormulario();

  cargando = false;
  guardando = false;
  mensaje = '';
  error = '';

  private readonly institucionService = inject(InstitucionService);

  ngOnInit(): void {
    this.cargarConfiguracion();
  }

  cargarConfiguracion(): void {
    this.cargando = true;
    this.error = '';

    this.institucionService.getConfiguracion().subscribe({
      next: (configuracion) => {
        this.configuracion = configuracion;
        this.form = {
          nombreInstitucion: configuracion.nombreInstitucion ?? '',
          logoUrl: configuracion.logoUrl ?? null,
          mision: configuracion.mision ?? '',
          vision: configuracion.vision ?? ''
        };
        this.cargando = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar los parametros institucionales.';
        this.cargando = false;
      }
    });
  }

  guardarConfiguracion(): void {
    this.mensaje = '';
    this.error = '';

    this.guardando = true;
    this.institucionService.guardarConfiguracion({
      nombreInstitucion: this.normalizarTexto(this.form.nombreInstitucion),
      logoUrl: this.form.logoUrl,
      mision: this.normalizarTexto(this.form.mision),
      vision: this.normalizarTexto(this.form.vision)
    }).subscribe({
      next: (configuracion) => {
        this.configuracion = configuracion;
        this.form = {
          nombreInstitucion: configuracion.nombreInstitucion ?? '',
          logoUrl: configuracion.logoUrl ?? null,
          mision: configuracion.mision ?? '',
          vision: configuracion.vision ?? ''
        };
        this.guardando = false;
        this.mensaje = 'Parametros institucionales guardados correctamente.';
      },
      error: (response) => {
        this.guardando = false;
        this.error = this.obtenerMensajeError(response) ?? 'No se pudieron guardar los parametros institucionales.';
      }
    });
  }

  seleccionarLogo(event: Event): void {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0];

    if (!archivo) {
      return;
    }

    if (!InstitutionSettingsPageComponent.ALLOWED_LOGO_TYPES.has(archivo.type)) {
      this.error = 'El logo debe ser una imagen PNG, JPG o WEBP.';
      input.value = '';
      return;
    }

    if (archivo.size > InstitutionSettingsPageComponent.MAX_LOGO_SIZE_BYTES) {
      this.error = 'El logo no debe superar 150 KB.';
      input.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.form.logoUrl = typeof reader.result === 'string' ? reader.result : null;
      this.error = '';
    };
    reader.readAsDataURL(archivo);
    input.value = '';
  }

  quitarLogo(): void {
    this.form.logoUrl = null;
  }

  getNombreVistaPrevia(): string {
    return this.form.nombreInstitucion.trim() || 'Repositorio Academico';
  }

  getFechaActualizacion(): string {
    if (!this.configuracion?.fechaActualizacion) {
      return 'Sin guardar';
    }

    return new Intl.DateTimeFormat('es-NI', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(this.configuracion.fechaActualizacion));
  }

  private crearFormulario(): InstitucionForm {
    return {
      nombreInstitucion: '',
      logoUrl: null,
      mision: '',
      vision: ''
    };
  }

  private normalizarTexto(valor: string): string | null {
    const texto = valor.trim();
    return texto ? texto : null;
  }

  private obtenerMensajeError(response: unknown): string | null {
    if (typeof response === 'object' && response !== null && 'error' in response) {
      const error = (response as { error?: unknown }).error;
      return typeof error === 'string' && error.trim() ? error : null;
    }

    return null;
  }
}
