import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { Carrera } from '../../models/carrera';
import { Catalogo } from '../../models/catalogo';
import { CarrerasService } from '../../services/carreras.service';
import { CatalogosService } from '../../services/catalogos.service';

@Component({
  selector: 'app-carrera-lineas-investigacion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './carrera-lineas-investigacion.component.html',
  styleUrls: ['./carrera-lineas-investigacion.component.css']
})
export class CarreraLineasInvestigacionComponent implements OnInit {
  carreras: Carrera[] = [];
  lineasInvestigacion: Catalogo[] = [];
  carreraSeleccionadaId: number | null = null;
  lineaIdsSeleccionadas: number[] = [];

  cargando = false;
  guardando = false;
  mensaje = '';
  error = '';

  private readonly carrerasService = inject(CarrerasService);
  private readonly catalogosService = inject(CatalogosService);

  get carreraSeleccionada(): Carrera | undefined {
    return this.carreras.find((carrera) => carrera.id === this.carreraSeleccionadaId);
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;
    this.error = '';

    forkJoin({
      carreras: this.carrerasService.getCarreras(),
      lineasInvestigacion: this.catalogosService.getLineasInvestigacion()
    }).subscribe({
      next: ({ carreras, lineasInvestigacion }) => {
        this.carreras = this.ordenarCarreras(carreras);
        this.lineasInvestigacion = this.ordenarCatalogo(lineasInvestigacion);
        this.sincronizarCarreraSeleccionada();
        this.cargando = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar las carreras y lineas de investigacion.';
        this.cargando = false;
      }
    });
  }

  seleccionarCarrera(carreraId: number | null): void {
    this.carreraSeleccionadaId = carreraId;
    const carrera = this.carreraSeleccionada;
    this.lineaIdsSeleccionadas = carrera?.lineasInvestigacion.map((linea) => linea.id) ?? [];
    this.mensaje = '';
    this.error = '';
  }

  toggleLineaInvestigacion(lineaInvestigacionId: number, checked: boolean): void {
    this.lineaIdsSeleccionadas = checked
      ? [...new Set([...this.lineaIdsSeleccionadas, lineaInvestigacionId])]
      : this.lineaIdsSeleccionadas.filter((item) => item !== lineaInvestigacionId);
  }

  lineaSeleccionada(lineaInvestigacionId: number): boolean {
    return this.lineaIdsSeleccionadas.includes(lineaInvestigacionId);
  }

  guardarLineas(): void {
    if (this.carreraSeleccionadaId == null) {
      this.error = 'Selecciona una carrera.';
      return;
    }

    this.guardando = true;
    this.mensaje = '';
    this.error = '';

    this.carrerasService.actualizarLineasInvestigacion(this.carreraSeleccionadaId, {
      lineaInvestigacionIds: this.lineaIdsSeleccionadas
    }).subscribe({
      next: (carreraActualizada) => {
        this.carreras = this.ordenarCarreras(
          this.carreras.map((carrera) => carrera.id === carreraActualizada.id ? carreraActualizada : carrera)
        );
        this.seleccionarCarrera(carreraActualizada.id);
        this.mensaje = 'Lineas de investigacion actualizadas correctamente.';
        this.guardando = false;
      },
      error: (response) => {
        this.error = response.error || 'No se pudieron actualizar las lineas de investigacion.';
        this.guardando = false;
      }
    });
  }

  private sincronizarCarreraSeleccionada(): void {
    const existeSeleccion = this.carreras.some((carrera) => carrera.id === this.carreraSeleccionadaId);
    const carreraId = existeSeleccion ? this.carreraSeleccionadaId : this.carreras[0]?.id ?? null;
    this.seleccionarCarrera(carreraId);
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
