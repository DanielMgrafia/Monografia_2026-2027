import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Catalogo } from '../../models/catalogo';
import { CatalogosService } from '../../services/catalogos.service';

type EstadoCatalogo = 'Activo' | 'Inactivo';

@Component({
  selector: 'app-crear-linea-investigacion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crear-linea-investigacion.component.html',
  styleUrls: ['./crear-linea-investigacion.component.css']
})
export class CrearLineaInvestigacionComponent implements OnInit {
  descripcion = '';
  lineasInvestigacion: Catalogo[] = [];
  lineaEnEdicion: Catalogo | null = null;
  editDescripcion = '';
  editEstado: EstadoCatalogo = 'Activo';

  cargando = false;
  guardando = false;
  procesandoId: number | null = null;
  mensaje = '';
  error = '';

  private readonly catalogosService = inject(CatalogosService);

  ngOnInit(): void {
    this.cargarLineasInvestigacion();
  }

  cargarLineasInvestigacion(): void {
    this.cargando = true;
    this.error = '';

    this.catalogosService.getLineasInvestigacion(true).subscribe({
      next: (lineasInvestigacion) => {
        this.lineasInvestigacion = this.ordenarLineasInvestigacion(lineasInvestigacion);
        this.cargando = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar las lineas de investigacion.';
        this.cargando = false;
      }
    });
  }

  guardarLineaInvestigacion(): void {
    const descripcion = this.descripcion.trim();
    this.mensaje = '';
    this.error = '';

    if (!descripcion) {
      this.error = 'La descripcion es obligatoria.';
      return;
    }

    this.guardando = true;

    this.catalogosService.crearLineaInvestigacion(descripcion).subscribe({
      next: (lineaInvestigacion) => {
        this.lineasInvestigacion = this.ordenarLineasInvestigacion([
          ...this.lineasInvestigacion,
          lineaInvestigacion
        ]);
        this.descripcion = '';
        this.mensaje = 'Linea de investigacion guardada correctamente.';
        this.guardando = false;
      },
      error: (response) => {
        this.error = response.status === 409
          ? 'Ya existe una linea de investigacion con esa descripcion.'
          : 'No se pudo guardar la linea de investigacion.';
        this.guardando = false;
      }
    });
  }

  abrirEdicion(lineaInvestigacion: Catalogo): void {
    this.mensaje = '';
    this.error = '';
    this.lineaEnEdicion = lineaInvestigacion;
    this.editDescripcion = lineaInvestigacion.descripcion;
    this.editEstado = this.normalizarEstado(lineaInvestigacion.estado);
  }

  cancelarEdicion(): void {
    this.lineaEnEdicion = null;
    this.editDescripcion = '';
    this.editEstado = 'Activo';
  }

  guardarEdicion(): void {
    if (!this.lineaEnEdicion) {
      return;
    }

    const descripcion = this.editDescripcion.trim();
    if (!descripcion) {
      this.error = 'La descripcion es obligatoria.';
      return;
    }

    this.procesandoId = this.lineaEnEdicion.id;
    this.mensaje = '';
    this.error = '';

    this.catalogosService.actualizarLineaInvestigacion(this.lineaEnEdicion.id, {
      descripcion,
      estado: this.editEstado
    }).subscribe({
      next: (actualizada) => {
        this.reemplazarLineaInvestigacion(actualizada);
        this.procesandoId = null;
        this.cancelarEdicion();
        this.mensaje = 'Linea de investigacion actualizada correctamente.';
      },
      error: (response) => {
        this.procesandoId = null;
        this.error = response.status === 409
          ? 'Ya existe una linea de investigacion con esa descripcion.'
          : response.error || 'No se pudo actualizar la linea de investigacion.';
      }
    });
  }

  cambiarEstado(lineaInvestigacion: Catalogo): void {
    const nuevoEstado: EstadoCatalogo = this.normalizarEstado(lineaInvestigacion.estado) === 'Activo' ? 'Inactivo' : 'Activo';
    this.procesandoId = lineaInvestigacion.id;
    this.mensaje = '';
    this.error = '';

    this.catalogosService.actualizarEstadoLineaInvestigacion(lineaInvestigacion.id, nuevoEstado).subscribe({
      next: (actualizada) => {
        this.reemplazarLineaInvestigacion(actualizada);
        this.procesandoId = null;
        this.mensaje = `Linea de investigacion ${nuevoEstado === 'Activo' ? 'activada' : 'desactivada'}.`;
      },
      error: (response) => {
        this.procesandoId = null;
        this.error = response.error || 'No se pudo actualizar el estado de la linea de investigacion.';
      }
    });
  }

  getEstadoClass(estado?: string | null): string {
    return this.normalizarEstado(estado) === 'Activo' ? 'activo' : 'inactivo';
  }

  getToggleLabel(item: Catalogo): string {
    return this.normalizarEstado(item.estado) === 'Activo' ? 'Desactivar' : 'Activar';
  }

  private reemplazarLineaInvestigacion(actualizada: Catalogo): void {
    this.lineasInvestigacion = this.ordenarLineasInvestigacion(
      this.lineasInvestigacion.map((linea) => linea.id === actualizada.id ? actualizada : linea)
    );
  }

  private ordenarLineasInvestigacion(lineasInvestigacion: Catalogo[]): Catalogo[] {
    return [...lineasInvestigacion].sort((a, b) =>
      a.descripcion.localeCompare(b.descripcion, 'es', { sensitivity: 'base' })
    );
  }

  private normalizarEstado(estado?: string | null): EstadoCatalogo {
    return estado === 'Inactivo' ? 'Inactivo' : 'Activo';
  }
}
