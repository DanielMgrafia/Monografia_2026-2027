import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Carrera } from '../../models/carrera';
import { Catalogo } from '../../models/catalogo';
import { CarrerasService } from '../../services/carreras.service';
import { CatalogosService } from '../../services/catalogos.service';
import { CrearCarreraComponent } from './crear-carrera.component';

describe('CrearCarreraComponent', () => {
  let component: CrearCarreraComponent;
  let fixture: ComponentFixture<CrearCarreraComponent>;
  let carrerasServiceSpy: jasmine.SpyObj<CarrerasService>;
  let catalogosServiceSpy: jasmine.SpyObj<CatalogosService>;

  const mockCarreras: Carrera[] = [
    {
      id: 1,
      descripcion: 'Ingenieria en Sistemas',
      facultadId: 1,
      facultad: 'Facultad de Ingenieria',
      areaConocimientoId: 1,
      areaConocimiento: 'Tecnologia',
      lineasInvestigacion: []
    }
  ];

  const mockFacultades: Catalogo[] = [
    { id: 1, descripcion: 'Facultad de Ingenieria' }
  ];

  const mockAreasConocimiento: Catalogo[] = [
    { id: 1, descripcion: 'Tecnologia' }
  ];

  beforeEach(async () => {
    carrerasServiceSpy = jasmine.createSpyObj<CarrerasService>(
      'CarrerasService',
      ['getCarreras', 'crearCarrera']
    );

    catalogosServiceSpy = jasmine.createSpyObj<CatalogosService>(
      'CatalogosService',
      ['getFacultades', 'getAreasConocimiento']
    );

    carrerasServiceSpy.getCarreras.and.returnValue(of(mockCarreras));
    carrerasServiceSpy.crearCarrera.and.returnValue(
      of({
        id: 2,
        descripcion: 'Arquitectura',
        facultadId: 1,
        facultad: 'Facultad de Ingenieria',
        areaConocimientoId: 1,
        areaConocimiento: 'Tecnologia',
        lineasInvestigacion: []
      })
    );
    catalogosServiceSpy.getFacultades.and.returnValue(of(mockFacultades));
    catalogosServiceSpy.getAreasConocimiento.and.returnValue(of(mockAreasConocimiento));

    await TestBed.configureTestingModule({
      imports: [CrearCarreraComponent],
      providers: [
        { provide: CarrerasService, useValue: carrerasServiceSpy },
        { provide: CatalogosService, useValue: catalogosServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CrearCarreraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load careers and related catalogs on init', () => {
    expect(carrerasServiceSpy.getCarreras).toHaveBeenCalled();
    expect(catalogosServiceSpy.getFacultades).toHaveBeenCalled();
    expect(catalogosServiceSpy.getAreasConocimiento).toHaveBeenCalled();
    expect(component.carreras).toEqual(mockCarreras);
    expect(component.facultades).toEqual(mockFacultades);
    expect(component.areasConocimiento).toEqual(mockAreasConocimiento);
  });

  it('should save a new career and update the list', () => {
    component.descripcion = 'Arquitectura';
    component.facultadId = 1;
    component.areaConocimientoId = 1;

    component.guardarCarrera();

    expect(carrerasServiceSpy.crearCarrera).toHaveBeenCalledWith({
      descripcion: 'Arquitectura',
      facultadId: 1,
      areaConocimientoId: 1
    });
    expect(component.carreras.map((carrera) => carrera.descripcion)).toEqual([
      'Arquitectura',
      'Ingenieria en Sistemas'
    ]);
    expect(component.mensaje).toContain('guardada correctamente');
  });
});
