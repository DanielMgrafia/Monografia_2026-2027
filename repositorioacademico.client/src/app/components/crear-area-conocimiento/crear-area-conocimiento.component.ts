import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Catalogo } from '../../models/catalogo';
import { CatalogosService } from '../../services/catalogos.service';

type EstadoCatalogo = 'Activo' | 'Inactivo';

@Component({
  selector: 'app-crear-area-conocimiento',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crear-area-conocimiento.component.html',
  styleUrls: ['./crear-area-conocimiento.component.css']
})
export class CrearAreaConocimientoComponent implements OnInit {
  descripcion = '';
  areasConocimiento: Catalogo[] = [];
  areaEnEdicion: Catalogo | null = null;
  editDescripcion = '';
  editEstado: EstadoCatalogo = 'Activo';

  cargando = false;
  guardando = false;
  procesandoId: number | null = null;
  mensaje = '';
  error = '';

  private readonly catalogosService = inject(CatalogosService);

  ngOnInit(): void {
    this.cargarAreasConocimiento();
  }

  cargarAreasConocimiento(): void {
    this.cargando = true;
    this.error = '';

    this.catalogosService.getAreasConocimiento(true).subscribe({
      next: (areasConocimiento) => {
        this.areasConocimiento = this.ordenarAreasConocimiento(areasConocimiento);
        this.cargando = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar las areas de conocimiento.';
        this.cargando = false;
      }
    });
  }

  guardarAreaConocimiento(): void {
    const descripcion = this.descripcion.trim();
    this.mensaje = '';
    this.error = '';

    if (!descripcion) {
      this.error = 'La descripcion es obligatoria.';
      return;
    }

    this.guardando = true;

    this.catalogosService.crearAreaConocimiento(descripcion).subscribe({
      next: (areaConocimiento) => {
        this.areasConocimiento = this.ordenarAreasConocimiento([...this.areasConocimiento, areaConocimiento]);
        this.descripcion = '';
        this.mensaje = 'Area de conocimiento guardada correctamente.';
        this.guardando = false;
      },
      error: (response) => {
        this.error = response.status === 409
          ? 'Ya existe un area de conocimiento con esa descripcion.'
          : 'No se pudo guardar el area de conocimiento.';
        this.guardando = false;
      }
    });
  }

  abrirEdicion(areaConocimiento: Catalogo): void {
    this.mensaje = '';
    this.error = '';
    this.areaEnEdicion = areaConocimiento;
    this.editDescripcion = areaConocimiento.descripcion;
    this.editEstado = this.normalizarEstado(areaConocimiento.estado);
  }

  cancelarEdicion(): void {
    this.areaEnEdicion = null;
    this.editDescripcion = '';
    this.editEstado = 'Activo';
  }

  guardarEdicion(): void {
    if (!this.areaEnEdicion) {
      return;
    }

    const descripcion = this.editDescripcion.trim();
    if (!descripcion) {
      this.error = 'La descripcion es obligatoria.';
      return;
    }

    this.procesandoId = this.areaEnEdicion.id;
    this.mensaje = '';
    this.error = '';

    this.catalogosService.actualizarAreaConocimiento(this.areaEnEdicion.id, {
      descripcion,
      estado: this.editEstado
    }).subscribe({
      next: (actualizada) => {
        this.reemplazarAreaConocimiento(actualizada);
        this.procesandoId = null;
        this.cancelarEdicion();
        this.mensaje = 'Area de conocimiento actualizada correctamente.';
      },
      error: (response) => {
        this.procesandoId = null;
        this.error = response.status === 409
          ? 'Ya existe un area de conocimiento con esa descripcion.'
          : response.error || 'No se pudo actualizar el area de conocimiento.';
      }
    });
  }

  cambiarEstado(areaConocimiento: Catalogo): void {
    const nuevoEstado: EstadoCatalogo = this.normalizarEstado(areaConocimiento.estado) === 'Activo' ? 'Inactivo' : 'Activo';
    this.procesandoId = areaConocimiento.id;
    this.mensaje = '';
    this.error = '';

    this.catalogosService.actualizarEstadoAreaConocimiento(areaConocimiento.id, nuevoEstado).subscribe({
      next: (actualizada) => {
        this.reemplazarAreaConocimiento(actualizada);
        this.procesandoId = null;
        this.mensaje = `Area de conocimiento ${nuevoEstado === 'Activo' ? 'activada' : 'desactivada'}.`;
      },
      error: (response) => {
        this.procesandoId = null;
        this.error = response.error || 'No se pudo actualizar el estado del area de conocimiento.';
      }
    });
  }

  getEstadoClass(estado?: string | null): string {
    return this.normalizarEstado(estado) === 'Activo' ? 'activo' : 'inactivo';
  }

  getToggleLabel(item: Catalogo): string {
    return this.normalizarEstado(item.estado) === 'Activo' ? 'Desactivar' : 'Activar';
  }

  private reemplazarAreaConocimiento(actualizada: Catalogo): void {
    this.areasConocimiento = this.ordenarAreasConocimiento(
      this.areasConocimiento.map((area) => area.id === actualizada.id ? actualizada : area)
    );
  }

  private ordenarAreasConocimiento(areasConocimiento: Catalogo[]): Catalogo[] {
    return [...areasConocimiento].sort((a, b) =>
      a.descripcion.localeCompare(b.descripcion, 'es', { sensitivity: 'base' })
    );
  }

  private normalizarEstado(estado?: string | null): EstadoCatalogo {
    return estado === 'Inactivo' ? 'Inactivo' : 'Activo';
  }
}
