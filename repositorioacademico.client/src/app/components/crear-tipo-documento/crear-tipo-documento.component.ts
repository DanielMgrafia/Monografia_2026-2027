import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Catalogo } from '../../models/catalogo';
import { CatalogosService } from '../../services/catalogos.service';

type EstadoCatalogo = 'Activo' | 'Inactivo';

@Component({
  selector: 'app-crear-tipo-documento',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crear-tipo-documento.component.html',
  styleUrls: ['./crear-tipo-documento.component.css']
})
export class CrearTipoDocumentoComponent implements OnInit {
  descripcion = '';
  tiposDocumento: Catalogo[] = [];
  tipoDocumentoEnEdicion: Catalogo | null = null;
  editDescripcion = '';
  editEstado: EstadoCatalogo = 'Activo';

  cargando = false;
  guardando = false;
  procesandoId: number | null = null;
  mensaje = '';
  error = '';

  private readonly catalogosService = inject(CatalogosService);

  ngOnInit(): void {
    this.cargarTiposDocumento();
  }

  cargarTiposDocumento(): void {
    this.cargando = true;
    this.error = '';

    this.catalogosService.getTiposDocumento(true).subscribe({
      next: (tiposDocumento) => {
        this.tiposDocumento = this.ordenarTiposDocumento(tiposDocumento);
        this.cargando = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar los tipos de documento.';
        this.cargando = false;
      }
    });
  }

  guardarTipoDocumento(): void {
    const descripcion = this.descripcion.trim();
    this.mensaje = '';
    this.error = '';

    if (!descripcion) {
      this.error = 'La descripcion es obligatoria.';
      return;
    }

    this.guardando = true;

    this.catalogosService.crearTipoDocumento(descripcion).subscribe({
      next: (tipoDocumento) => {
        this.tiposDocumento = this.ordenarTiposDocumento([...this.tiposDocumento, tipoDocumento]);
        this.descripcion = '';
        this.mensaje = 'Tipo de documento guardado correctamente.';
        this.guardando = false;
      },
      error: (response) => {
        this.error = response.status === 409
          ? 'Ya existe un tipo de documento con esa descripcion.'
          : 'No se pudo guardar el tipo de documento.';
        this.guardando = false;
      }
    });
  }

  abrirEdicion(tipoDocumento: Catalogo): void {
    this.mensaje = '';
    this.error = '';
    this.tipoDocumentoEnEdicion = tipoDocumento;
    this.editDescripcion = tipoDocumento.descripcion;
    this.editEstado = this.normalizarEstado(tipoDocumento.estado);
  }

  cancelarEdicion(): void {
    this.tipoDocumentoEnEdicion = null;
    this.editDescripcion = '';
    this.editEstado = 'Activo';
  }

  guardarEdicion(): void {
    if (!this.tipoDocumentoEnEdicion) {
      return;
    }

    const descripcion = this.editDescripcion.trim();
    if (!descripcion) {
      this.error = 'La descripcion es obligatoria.';
      return;
    }

    this.procesandoId = this.tipoDocumentoEnEdicion.id;
    this.mensaje = '';
    this.error = '';

    this.catalogosService.actualizarTipoDocumento(this.tipoDocumentoEnEdicion.id, {
      descripcion,
      estado: this.editEstado
    }).subscribe({
      next: (actualizado) => {
        this.reemplazarTipoDocumento(actualizado);
        this.procesandoId = null;
        this.cancelarEdicion();
        this.mensaje = 'Tipo de documento actualizado correctamente.';
      },
      error: (response) => {
        this.procesandoId = null;
        this.error = response.status === 409
          ? 'Ya existe un tipo de documento con esa descripcion.'
          : response.error || 'No se pudo actualizar el tipo de documento.';
      }
    });
  }

  cambiarEstado(tipoDocumento: Catalogo): void {
    const nuevoEstado: EstadoCatalogo = this.normalizarEstado(tipoDocumento.estado) === 'Activo' ? 'Inactivo' : 'Activo';
    this.procesandoId = tipoDocumento.id;
    this.mensaje = '';
    this.error = '';

    this.catalogosService.actualizarEstadoTipoDocumento(tipoDocumento.id, nuevoEstado).subscribe({
      next: (actualizado) => {
        this.reemplazarTipoDocumento(actualizado);
        this.procesandoId = null;
        this.mensaje = `Tipo de documento ${nuevoEstado === 'Activo' ? 'activado' : 'desactivado'}.`;
      },
      error: (response) => {
        this.procesandoId = null;
        this.error = response.error || 'No se pudo actualizar el estado del tipo de documento.';
      }
    });
  }

  getEstadoClass(estado?: string | null): string {
    return this.normalizarEstado(estado) === 'Activo' ? 'activo' : 'inactivo';
  }

  getToggleLabel(item: Catalogo): string {
    return this.normalizarEstado(item.estado) === 'Activo' ? 'Desactivar' : 'Activar';
  }

  private reemplazarTipoDocumento(actualizado: Catalogo): void {
    this.tiposDocumento = this.ordenarTiposDocumento(
      this.tiposDocumento.map((tipoDocumento) =>
        tipoDocumento.id === actualizado.id ? actualizado : tipoDocumento
      )
    );
  }

  private ordenarTiposDocumento(tiposDocumento: Catalogo[]): Catalogo[] {
    return [...tiposDocumento].sort((a, b) =>
      a.descripcion.localeCompare(b.descripcion, 'es', { sensitivity: 'base' })
    );
  }

  private normalizarEstado(estado?: string | null): EstadoCatalogo {
    return estado === 'Inactivo' ? 'Inactivo' : 'Activo';
  }
}
