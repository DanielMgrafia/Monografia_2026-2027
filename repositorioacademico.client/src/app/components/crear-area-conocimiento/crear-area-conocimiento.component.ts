import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Catalogo } from '../../models/catalogo';
import { CatalogosService } from '../../services/catalogos.service';

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

  cargando = false;
  guardando = false;
  mensaje = '';
  error = '';

  private readonly catalogosService = inject(CatalogosService);

  ngOnInit(): void {
    this.cargarAreasConocimiento();
  }

  cargarAreasConocimiento(): void {
    this.cargando = true;
    this.error = '';

    this.catalogosService.getAreasConocimiento().subscribe({
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

  private ordenarAreasConocimiento(areasConocimiento: Catalogo[]): Catalogo[] {
    return [...areasConocimiento].sort((a, b) =>
      a.descripcion.localeCompare(b.descripcion, 'es', { sensitivity: 'base' })
    );
  }
}
