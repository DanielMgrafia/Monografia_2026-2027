import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { Carrera } from '../../models/carrera';
import { Catalogo } from '../../models/catalogo';
import { CarrerasService } from '../../services/carreras.service';
import { CatalogosService } from '../../services/catalogos.service';

type EstadoCatalogo = 'Activo' | 'Inactivo';

@Component({
  selector: 'app-crear-carrera',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crear-carrera.component.html',
  styleUrls: ['./crear-carrera.component.css']
})
export class CrearCarreraComponent implements OnInit {
  descripcion = '';
  areaConocimientoId: number | null = null;
  carreraEnEdicion: Carrera | null = null;
  editDescripcion = '';
  editAreaConocimientoId: number | null = null;
  editEstado: EstadoCatalogo = 'Activo';

  carreras: Carrera[] = [];
  areasConocimiento: Catalogo[] = [];

  cargando = false;
  guardando = false;
  procesandoId: number | null = null;
  mensaje = '';
  error = '';

  private readonly carrerasService = inject(CarrerasService);
  private readonly catalogosService = inject(CatalogosService);

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;
    this.error = '';

    forkJoin({
      carreras: this.carrerasService.getCarreras(true),
      areasConocimiento: this.catalogosService.getAreasConocimiento(true)
    }).subscribe({
      next: ({ carreras, areasConocimiento }) => {
        this.carreras = this.ordenarCarreras(carreras);
        this.areasConocimiento = this.ordenarCatalogo(areasConocimiento);
        this.cargando = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar las carreras y catalogos relacionados.';
        this.cargando = false;
      }
    });
  }

  guardarCarrera(): void {
    const descripcion = this.descripcion.trim();
    this.mensaje = '';
    this.error = '';

    if (!descripcion || this.areaConocimientoId == null) {
      this.error = 'Completa la carrera y el area de conocimiento.';
      return;
    }

    this.guardando = true;

    this.carrerasService.crearCarrera({
      descripcion,
      areaConocimientoId: this.areaConocimientoId
    }).subscribe({
      next: (carrera) => {
        this.carreras = this.ordenarCarreras([...this.carreras, carrera]);
        this.descripcion = '';
        this.areaConocimientoId = null;
        this.mensaje = 'Carrera guardada correctamente.';
        this.guardando = false;
      },
      error: (response) => {
        this.error = response.status === 409
          ? 'Ya existe una carrera con esa descripcion.'
          : response.error || 'No se pudo guardar la carrera.';
        this.guardando = false;
      }
    });
  }

  abrirEdicion(carrera: Carrera): void {
    this.mensaje = '';
    this.error = '';
    this.carreraEnEdicion = carrera;
    this.editDescripcion = carrera.descripcion;
    this.editAreaConocimientoId = carrera.areaConocimientoId;
    this.editEstado = this.normalizarEstado(carrera.estado);
  }

  cancelarEdicion(): void {
    this.carreraEnEdicion = null;
    this.editDescripcion = '';
    this.editAreaConocimientoId = null;
    this.editEstado = 'Activo';
  }

  guardarEdicion(): void {
    if (!this.carreraEnEdicion) {
      return;
    }

    const descripcion = this.editDescripcion.trim();
    if (!descripcion || this.editAreaConocimientoId == null) {
      this.error = 'Completa la carrera y el area de conocimiento.';
      return;
    }

    this.procesandoId = this.carreraEnEdicion.id;
    this.mensaje = '';
    this.error = '';

    this.carrerasService.actualizarCarrera(this.carreraEnEdicion.id, {
      descripcion,
      areaConocimientoId: this.editAreaConocimientoId,
      estado: this.editEstado
    }).subscribe({
      next: (actualizada) => {
        this.reemplazarCarrera(actualizada);
        this.procesandoId = null;
        this.cancelarEdicion();
        this.mensaje = 'Carrera actualizada correctamente.';
      },
      error: (response) => {
        this.procesandoId = null;
        this.error = response.status === 409
          ? 'Ya existe una carrera con esa descripcion.'
          : response.error || 'No se pudo actualizar la carrera.';
      }
    });
  }

  cambiarEstado(carrera: Carrera): void {
    const nuevoEstado: EstadoCatalogo = this.normalizarEstado(carrera.estado) === 'Activo' ? 'Inactivo' : 'Activo';
    this.procesandoId = carrera.id;
    this.mensaje = '';
    this.error = '';

    this.carrerasService.actualizarEstadoCarrera(carrera.id, nuevoEstado).subscribe({
      next: (actualizada) => {
        this.reemplazarCarrera(actualizada);
        this.procesandoId = null;
        this.mensaje = `Carrera ${nuevoEstado === 'Activo' ? 'activada' : 'desactivada'}.`;
      },
      error: (response) => {
        this.procesandoId = null;
        this.error = response.error || 'No se pudo actualizar el estado de la carrera.';
      }
    });
  }

  get areasConocimientoActivas(): Catalogo[] {
    return this.areasConocimiento.filter((area) => this.normalizarEstado(area.estado) === 'Activo');
  }

  getEstadoClass(estado?: string | null): string {
    return this.normalizarEstado(estado) === 'Activo' ? 'activo' : 'inactivo';
  }

  getToggleLabel(item: Carrera): string {
    return this.normalizarEstado(item.estado) === 'Activo' ? 'Desactivar' : 'Activar';
  }

  private reemplazarCarrera(actualizada: Carrera): void {
    this.carreras = this.ordenarCarreras(
      this.carreras.map((carrera) => carrera.id === actualizada.id ? actualizada : carrera)
    );
  }

  private ordenarCarreras(carreras: Carrera[]): Carrera[] {
    return [...carreras].sort((a, b) =>
      a.descripcion.localeCompare(b.descripcion, 'es', { sensitivity: 'base' })
    );
  }

  private ordenarCatalogo(items: Catalogo[]): Catalogo[] {
    return [...items].sort((a, b) =>
      a.descripcion.localeCompare(b.descripcion, 'es', { sensitivity: 'base' })
    );
  }

  private normalizarEstado(estado?: string | null): EstadoCatalogo {
    return estado === 'Inactivo' ? 'Inactivo' : 'Activo';
  }
}
