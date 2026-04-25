import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Catalogo } from '../../models/catalogo';
import { CatalogosService } from '../../services/catalogos.service';

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

  cargando = false;
  guardando = false;
  mensaje = '';
  error = '';

  private readonly catalogosService = inject(CatalogosService);

  ngOnInit(): void {
    this.cargarFacultades();
  }

  cargarFacultades(): void {
    this.cargando = true;
    this.error = '';

    this.catalogosService.getFacultades().subscribe({
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

  private ordenarFacultades(facultades: Catalogo[]): Catalogo[] {
    return [...facultades].sort((a, b) =>
      a.descripcion.localeCompare(b.descripcion, 'es', { sensitivity: 'base' })
    );
  }
}
