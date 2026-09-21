import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Carrera } from '../../models/carrera';
import { Catalogo } from '../../models/catalogo';
import { CarrerasService } from '../../services/carreras.service';
import { CatalogosService } from '../../services/catalogos.service';
import { CarreraLineasInvestigacionComponent } from './carrera-lineas-investigacion.component';

describe('CarreraLineasInvestigacionComponent', () => {
  let component: CarreraLineasInvestigacionComponent;
  let fixture: ComponentFixture<CarreraLineasInvestigacionComponent>;
  let carrerasServiceSpy: jasmine.SpyObj<CarrerasService>;
  let catalogosServiceSpy: jasmine.SpyObj<CatalogosService>;

  const mockLineasInvestigacion: Catalogo[] = [
    { id: 1, descripcion: 'Inteligencia artificial aplicada' },
    { id: 2, descripcion: 'Innovacion educativa' }
  ];

  const mockCarreras: Carrera[] = [
    {
      id: 1,
      descripcion: 'Ingenieria en Sistemas',
      areaConocimientoId: 1,
      areaConocimiento: 'Tecnologia',
      lineasInvestigacion: [mockLineasInvestigacion[0]]
    }
  ];

  beforeEach(async () => {
    carrerasServiceSpy = jasmine.createSpyObj<CarrerasService>(
      'CarrerasService',
      ['getCarreras', 'actualizarLineasInvestigacion']
    );

    catalogosServiceSpy = jasmine.createSpyObj<CatalogosService>(
      'CatalogosService',
      ['getLineasInvestigacion']
    );

    carrerasServiceSpy.getCarreras.and.returnValue(of(mockCarreras));
    carrerasServiceSpy.actualizarLineasInvestigacion.and.returnValue(
      of({
        ...mockCarreras[0],
        lineasInvestigacion: mockLineasInvestigacion
      })
    );
    catalogosServiceSpy.getLineasInvestigacion.and.returnValue(of(mockLineasInvestigacion));

    await TestBed.configureTestingModule({
      imports: [CarreraLineasInvestigacionComponent],
      providers: [
        { provide: CarrerasService, useValue: carrerasServiceSpy },
        { provide: CatalogosService, useValue: catalogosServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CarreraLineasInvestigacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should select the first career and load its research lines on init', () => {
    expect(carrerasServiceSpy.getCarreras).toHaveBeenCalled();
    expect(catalogosServiceSpy.getLineasInvestigacion).toHaveBeenCalled();
    expect(component.carreraSeleccionadaId).toBe(1);
    expect(component.lineaIdsSeleccionadas).toEqual([1]);
  });

  it('should update selected research lines for the career', () => {
    component.toggleLineaInvestigacion(2, true);

    component.guardarLineas();

    expect(carrerasServiceSpy.actualizarLineasInvestigacion).toHaveBeenCalledWith(1, {
      lineaInvestigacionIds: [1, 2]
    });
    expect(component.lineaIdsSeleccionadas).toEqual([1, 2]);
    expect(component.mensaje).toContain('actualizadas correctamente');
  });
});
