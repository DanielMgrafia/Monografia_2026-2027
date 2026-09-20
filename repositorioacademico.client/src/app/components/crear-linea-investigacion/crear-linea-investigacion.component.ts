import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Catalogo } from '../../models/catalogo';
import { CatalogosService } from '../../services/catalogos.service';

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

  cargando = false;
  guardando = false;
  mensaje = '';
  error = '';

  private readonly catalogosService = inject(CatalogosService);

  ngOnInit(): void {
    this.cargarLineasInvestigacion();
  }

  cargarLineasInvestigacion(): void {
    this.cargando = true;
    this.error = '';

    this.catalogosService.getLineasInvestigacion().subscribe({
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

  private ordenarLineasInvestigacion(lineasInvestigacion: Catalogo[]): Catalogo[] {
    return [...lineasInvestigacion].sort((a, b) =>
      a.descripcion.localeCompare(b.descripcion, 'es', { sensitivity: 'base' })
    );
  }
}
