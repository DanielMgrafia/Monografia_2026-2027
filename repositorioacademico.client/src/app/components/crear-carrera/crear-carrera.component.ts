import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { Carrera } from '../../models/carrera';
import { Catalogo } from '../../models/catalogo';
import { CarrerasService } from '../../services/carreras.service';
import { CatalogosService } from '../../services/catalogos.service';

@Component({
  selector: 'app-crear-carrera',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crear-carrera.component.html',
  styleUrls: ['./crear-carrera.component.css']
})
export class CrearCarreraComponent implements OnInit {
  descripcion = '';
  facultadId: number | null = null;
  areaConocimientoId: number | null = null;

  carreras: Carrera[] = [];
  facultades: Catalogo[] = [];
  areasConocimiento: Catalogo[] = [];

  cargando = false;
  guardando = false;
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
      carreras: this.carrerasService.getCarreras(),
      facultades: this.catalogosService.getFacultades(),
      areasConocimiento: this.catalogosService.getAreasConocimiento()
    }).subscribe({
      next: ({ carreras, facultades, areasConocimiento }) => {
        this.carreras = this.ordenarCarreras(carreras);
        this.facultades = this.ordenarCatalogo(facultades);
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

    if (!descripcion || this.facultadId == null || this.areaConocimientoId == null) {
      this.error = 'Completa la carrera, facultad y area de conocimiento.';
      return;
    }

    this.guardando = true;

    this.carrerasService.crearCarrera({
      descripcion,
      facultadId: this.facultadId,
      areaConocimientoId: this.areaConocimientoId
    }).subscribe({
      next: (carrera) => {
        this.carreras = this.ordenarCarreras([...this.carreras, carrera]);
        this.descripcion = '';
        this.facultadId = null;
        this.areaConocimientoId = null;
        this.mensaje = 'Carrera guardada correctamente.';
        this.guardando = false;
      },
      error: (response) => {
        this.error = response.status === 409
          ? 'Ya existe una carrera con esa descripcion en la facultad seleccionada.'
          : response.error || 'No se pudo guardar la carrera.';
        this.guardando = false;
      }
    });
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
}
