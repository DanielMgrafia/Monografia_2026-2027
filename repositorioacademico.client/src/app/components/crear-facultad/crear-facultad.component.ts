import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Catalogo } from '../../models/catalogo';
import { CatalogosService } from '../../services/catalogos.service';

type EstadoCatalogo = 'Activo' | 'Inactivo';

@Component({
  selector: 'app-crear-facultad',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crear-facultad.component.html',
  styleUrls: ['./crear-facultad.component.css']
})
export class CrearFacultadComponent implements OnInit {
  descripcion = '';
  facultades: Catalogo[] = [];
  facultadEnEdicion: Catalogo | null = null;
  editDescripcion = '';
  editEstado: EstadoCatalogo = 'Activo';

  cargando = false;
  guardando = false;
  procesandoId: number | null = null;
  mensaje = '';
  error = '';

  private readonly catalogosService = inject(CatalogosService);

  ngOnInit(): void {
    this.cargarFacultades();
  }

  cargarFacultades(): void {
    this.cargando = true;
    this.error = '';

    this.catalogosService.getFacultades(true).subscribe({
      next: (facultades) => {
        this.facultades = this.ordenarFacultades(facultades);
        this.cargando = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar las facultades.';
        this.cargando = false;
      }
    });
  }

  guardarFacultad(): void {
    const descripcion = this.descripcion.trim();
    this.mensaje = '';
    this.error = '';

    if (!descripcion) {
      this.error = 'La descripcion es obligatoria.';
      return;
    }

    this.guardando = true;

    this.catalogosService.crearFacultad(descripcion).subscribe({
      next: (facultad) => {
        this.facultades = this.ordenarFacultades([...this.facultades, facultad]);
        this.descripcion = '';
        this.mensaje = 'Facultad guardada correctamente.';
        this.guardando = false;
      },
      error: (response) => {
        this.error = response.status === 409
          ? 'Ya existe una facultad con esa descripcion.'
          : 'No se pudo guardar la facultad.';
        this.guardando = false;
      }
    });
  }

  abrirEdicion(facultad: Catalogo): void {
    this.mensaje = '';
    this.error = '';
    this.facultadEnEdicion = facultad;
    this.editDescripcion = facultad.descripcion;
    this.editEstado = this.normalizarEstado(facultad.estado);
  }

  cancelarEdicion(): void {
    this.facultadEnEdicion = null;
    this.editDescripcion = '';
    this.editEstado = 'Activo';
  }

  guardarEdicion(): void {
    if (!this.facultadEnEdicion) {
      return;
    }

    const descripcion = this.editDescripcion.trim();
    if (!descripcion) {
      this.error = 'La descripcion es obligatoria.';
      return;
    }

    this.procesandoId = this.facultadEnEdicion.id;
    this.mensaje = '';
    this.error = '';

    this.catalogosService.actualizarFacultad(this.facultadEnEdicion.id, {
      descripcion,
      estado: this.editEstado
    }).subscribe({
      next: (actualizada) => {
        this.reemplazarFacultad(actualizada);
        this.procesandoId = null;
        this.cancelarEdicion();
        this.mensaje = 'Facultad actualizada correctamente.';
      },
      error: (response) => {
        this.procesandoId = null;
        this.error = response.status === 409
          ? 'Ya existe una facultad con esa descripcion.'
          : response.error || 'No se pudo actualizar la facultad.';
      }
    });
  }

  cambiarEstado(facultad: Catalogo): void {
    const nuevoEstado: EstadoCatalogo = this.normalizarEstado(facultad.estado) === 'Activo' ? 'Inactivo' : 'Activo';
    this.procesandoId = facultad.id;
    this.mensaje = '';
    this.error = '';

    this.catalogosService.actualizarEstadoFacultad(facultad.id, nuevoEstado).subscribe({
      next: (actualizada) => {
        this.reemplazarFacultad(actualizada);
        this.procesandoId = null;
        this.mensaje = `Facultad ${nuevoEstado === 'Activo' ? 'activada' : 'desactivada'}.`;
      },
      error: (response) => {
        this.procesandoId = null;
        this.error = response.error || 'No se pudo actualizar el estado de la facultad.';
      }
    });
  }

  getEstadoClass(estado?: string | null): string {
    return this.normalizarEstado(estado) === 'Activo' ? 'activo' : 'inactivo';
  }

  getToggleLabel(item: Catalogo): string {
    return this.normalizarEstado(item.estado) === 'Activo' ? 'Desactivar' : 'Activar';
  }

  private reemplazarFacultad(actualizada: Catalogo): void {
    this.facultades = this.ordenarFacultades(
      this.facultades.map((facultad) => facultad.id === actualizada.id ? actualizada : facultad)
    );
  }

  private ordenarFacultades(facultades: Catalogo[]): Catalogo[] {
    return [...facultades].sort((a, b) =>
      a.descripcion.localeCompare(b.descripcion, 'es', { sensitivity: 'base' })
    );
  }

  private normalizarEstado(estado?: string | null): EstadoCatalogo {
    return estado === 'Inactivo' ? 'Inactivo' : 'Activo';
  }
}
