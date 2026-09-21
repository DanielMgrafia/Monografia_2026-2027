import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { Catalogo } from '../../models/catalogo';
import { SublineaInvestigacion } from '../../models/sublinea-investigacion';
import { CatalogosService } from '../../services/catalogos.service';

type EstadoCatalogo = 'Activo' | 'Inactivo';

@Component({
  selector: 'app-crear-sublinea-investigacion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crear-sublinea-investigacion.component.html',
  styleUrls: ['./crear-sublinea-investigacion.component.css']
})
export class CrearSublineaInvestigacionComponent implements OnInit {
  descripcion = '';
  lineaInvestigacionId: number | null = null;
  sublineaEnEdicion: SublineaInvestigacion | null = null;
  editDescripcion = '';
  editLineaInvestigacionId: number | null = null;
  editEstado: EstadoCatalogo = 'Activo';

  lineasInvestigacion: Catalogo[] = [];
  sublineasInvestigacion: SublineaInvestigacion[] = [];

  cargando = false;
  guardando = false;
  procesandoId: number | null = null;
  mensaje = '';
  error = '';

  private readonly catalogosService = inject(CatalogosService);

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;
    this.error = '';

    forkJoin({
      lineasInvestigacion: this.catalogosService.getLineasInvestigacion(true),
      sublineasInvestigacion: this.catalogosService.getSublineasInvestigacion(true)
    }).subscribe({
      next: ({ lineasInvestigacion, sublineasInvestigacion }) => {
        this.lineasInvestigacion = this.ordenarCatalogo(lineasInvestigacion);
        this.sublineasInvestigacion = this.ordenarSublineas(sublineasInvestigacion);
        this.cargando = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar las sublineas y lineas de investigacion.';
        this.cargando = false;
      }
    });
  }

  guardarSublineaInvestigacion(): void {
    const descripcion = this.descripcion.trim();
    this.mensaje = '';
    this.error = '';

    if (!descripcion || this.lineaInvestigacionId == null) {
      this.error = 'Completa la sublinea y selecciona una linea de investigacion.';
      return;
    }

    this.guardando = true;

    this.catalogosService.crearSublineaInvestigacion({
      descripcion,
      lineaInvestigacionId: this.lineaInvestigacionId
    }).subscribe({
      next: (sublineaInvestigacion) => {
        this.sublineasInvestigacion = this.ordenarSublineas([
          ...this.sublineasInvestigacion,
          sublineaInvestigacion
        ]);
        this.descripcion = '';
        this.lineaInvestigacionId = null;
        this.mensaje = 'Sublinea de investigacion guardada correctamente.';
        this.guardando = false;
      },
      error: (response) => {
        this.error = response.status === 409
          ? 'Ya existe una sublinea con esa descripcion para la linea seleccionada.'
          : response.error || 'No se pudo guardar la sublinea de investigacion.';
        this.guardando = false;
      }
    });
  }

  abrirEdicion(sublineaInvestigacion: SublineaInvestigacion): void {
    this.mensaje = '';
    this.error = '';
    this.sublineaEnEdicion = sublineaInvestigacion;
    this.editDescripcion = sublineaInvestigacion.descripcion;
    this.editLineaInvestigacionId = sublineaInvestigacion.lineaInvestigacionId;
    this.editEstado = this.normalizarEstado(sublineaInvestigacion.estado);
  }

  cancelarEdicion(): void {
    this.sublineaEnEdicion = null;
    this.editDescripcion = '';
    this.editLineaInvestigacionId = null;
    this.editEstado = 'Activo';
  }

  guardarEdicion(): void {
    if (!this.sublineaEnEdicion) {
      return;
    }

    const descripcion = this.editDescripcion.trim();
    if (!descripcion || this.editLineaInvestigacionId == null) {
      this.error = 'Completa la sublinea y selecciona una linea de investigacion.';
      return;
    }

    this.procesandoId = this.sublineaEnEdicion.id;
    this.mensaje = '';
    this.error = '';

    this.catalogosService.actualizarSublineaInvestigacion(this.sublineaEnEdicion.id, {
      descripcion,
      lineaInvestigacionId: this.editLineaInvestigacionId,
      estado: this.editEstado
    }).subscribe({
      next: (actualizada) => {
        this.reemplazarSublinea(actualizada);
        this.procesandoId = null;
        this.cancelarEdicion();
        this.mensaje = 'Sublinea de investigacion actualizada correctamente.';
      },
      error: (response) => {
        this.procesandoId = null;
        this.error = response.status === 409
          ? 'Ya existe una sublinea con esa descripcion para la linea seleccionada.'
          : response.error || 'No se pudo actualizar la sublinea de investigacion.';
      }
    });
  }

  cambiarEstado(sublineaInvestigacion: SublineaInvestigacion): void {
    const nuevoEstado: EstadoCatalogo = this.normalizarEstado(sublineaInvestigacion.estado) === 'Activo'
      ? 'Inactivo'
      : 'Activo';
    this.procesandoId = sublineaInvestigacion.id;
    this.mensaje = '';
    this.error = '';

    this.catalogosService.actualizarEstadoSublineaInvestigacion(sublineaInvestigacion.id, nuevoEstado).subscribe({
      next: (actualizada) => {
        this.reemplazarSublinea(actualizada);
        this.procesandoId = null;
        this.mensaje = `Sublinea de investigacion ${nuevoEstado === 'Activo' ? 'activada' : 'desactivada'}.`;
      },
      error: (response) => {
        this.procesandoId = null;
        this.error = response.error || 'No se pudo actualizar el estado de la sublinea de investigacion.';
      }
    });
  }

  getSublineasPorLinea(lineaInvestigacionId: number): SublineaInvestigacion[] {
    return this.sublineasInvestigacion.filter((sublinea) =>
      sublinea.lineaInvestigacionId === lineaInvestigacionId
    );
  }

  get lineasActivas(): Catalogo[] {
    return this.lineasInvestigacion.filter((linea) => this.normalizarEstado(linea.estado) === 'Activo');
  }

  getLineasParaEdicion(): Catalogo[] {
    if (!this.sublineaEnEdicion || this.editLineaInvestigacionId == null) {
      return this.lineasActivas;
    }

    const lineaActual = this.lineasInvestigacion.find((linea) => linea.id === this.editLineaInvestigacionId);
    if (!lineaActual || this.lineasActivas.some((linea) => linea.id === lineaActual.id)) {
      return this.lineasActivas;
    }

    return this.ordenarCatalogo([...this.lineasActivas, lineaActual]);
  }

  getEstadoClass(estado?: string | null): string {
    return this.normalizarEstado(estado) === 'Activo' ? 'activo' : 'inactivo';
  }

  getToggleLabel(item: SublineaInvestigacion): string {
    return this.normalizarEstado(item.estado) === 'Activo' ? 'Desactivar' : 'Activar';
  }

  private reemplazarSublinea(actualizada: SublineaInvestigacion): void {
    this.sublineasInvestigacion = this.ordenarSublineas(
      this.sublineasInvestigacion.map((sublinea) =>
        sublinea.id === actualizada.id ? actualizada : sublinea
      )
    );
  }

  private ordenarCatalogo(items: Catalogo[]): Catalogo[] {
    return [...items].sort((a, b) =>
      a.descripcion.localeCompare(b.descripcion, 'es', { sensitivity: 'base' })
    );
  }

  private ordenarSublineas(sublineasInvestigacion: SublineaInvestigacion[]): SublineaInvestigacion[] {
    return [...sublineasInvestigacion].sort((a, b) => {
      const lineaComparacion = (a.lineaInvestigacion ?? '').localeCompare(
        b.lineaInvestigacion ?? '',
        'es',
        { sensitivity: 'base' }
      );

      return lineaComparacion !== 0
        ? lineaComparacion
        : a.descripcion.localeCompare(b.descripcion, 'es', { sensitivity: 'base' });
    });
  }

  private normalizarEstado(estado?: string | null): EstadoCatalogo {
    return estado === 'Inactivo' ? 'Inactivo' : 'Activo';
  }
}
