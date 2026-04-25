import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Catalogo } from '../../models/catalogo';
import { CatalogosService } from '../../services/catalogos.service';

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

  cargando = false;
  guardando = false;
  mensaje = '';
  error = '';

  private readonly catalogosService = inject(CatalogosService);

  ngOnInit(): void {
    this.cargarTiposDocumento();
  }

  cargarTiposDocumento(): void {
    this.cargando = true;
    this.error = '';

    this.catalogosService.getTiposDocumento().subscribe({
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

  private ordenarTiposDocumento(tiposDocumento: Catalogo[]): Catalogo[] {
    return [...tiposDocumento].sort((a, b) =>
      a.descripcion.localeCompare(b.descripcion, 'es', { sensitivity: 'base' })
    );
  }
}
