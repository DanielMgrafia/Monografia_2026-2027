import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { Catalogo } from '../../models/catalogo';
import { SublineaInvestigacion } from '../../models/sublinea-investigacion';
import { CatalogosService } from '../../services/catalogos.service';

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

  lineasInvestigacion: Catalogo[] = [];
  sublineasInvestigacion: SublineaInvestigacion[] = [];

  cargando = false;
  guardando = false;
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
      lineasInvestigacion: this.catalogosService.getLineasInvestigacion(),
      sublineasInvestigacion: this.catalogosService.getSublineasInvestigacion()
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

  getSublineasPorLinea(lineaInvestigacionId: number): SublineaInvestigacion[] {
    return this.sublineasInvestigacion.filter((sublinea) =>
      sublinea.lineaInvestigacionId === lineaInvestigacionId
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
}
