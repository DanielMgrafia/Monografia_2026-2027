import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EMPTY, of } from 'rxjs';
import { Catalogo } from '../../models/catalogo';
import { CatalogosService } from '../../services/catalogos.service';
import { CrearLineaInvestigacionComponent } from './crear-linea-investigacion.component';

describe('CrearLineaInvestigacionComponent', () => {
  let component: CrearLineaInvestigacionComponent;
  let fixture: ComponentFixture<CrearLineaInvestigacionComponent>;
  let catalogosServiceSpy: jasmine.SpyObj<CatalogosService>;

  const mockLineasInvestigacion: Catalogo[] = [
    { id: 1, descripcion: 'Desarrollo sostenible' },
    { id: 2, descripcion: 'Inteligencia artificial aplicada' }
  ];

  beforeEach(async () => {
    catalogosServiceSpy = jasmine.createSpyObj<CatalogosService>(
      'CatalogosService',
      ['getLineasInvestigacion', 'crearLineaInvestigacion'],
      { lineaInvestigacionCreada$: EMPTY }
    );

    catalogosServiceSpy.getLineasInvestigacion.and.returnValue(of(mockLineasInvestigacion));
    catalogosServiceSpy.crearLineaInvestigacion.and.returnValue(
      of({ id: 3, descripcion: 'Innovacion educativa' })
    );

    await TestBed.configureTestingModule({
      imports: [CrearLineaInvestigacionComponent],
      providers: [{ provide: CatalogosService, useValue: catalogosServiceSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(CrearLineaInvestigacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load research lines on init', () => {
    expect(catalogosServiceSpy.getLineasInvestigacion).toHaveBeenCalled();
    expect(component.lineasInvestigacion).toEqual([
      { id: 1, descripcion: 'Desarrollo sostenible' },
      { id: 2, descripcion: 'Inteligencia artificial aplicada' }
    ]);
  });

  it('should save a new research line and update the list', () => {
    component.descripcion = 'Innovacion educativa';

    component.guardarLineaInvestigacion();

    expect(catalogosServiceSpy.crearLineaInvestigacion).toHaveBeenCalledWith('Innovacion educativa');
    expect(component.lineasInvestigacion).toEqual([
      { id: 1, descripcion: 'Desarrollo sostenible' },
      { id: 3, descripcion: 'Innovacion educativa' },
      { id: 2, descripcion: 'Inteligencia artificial aplicada' }
    ]);
    expect(component.mensaje).toContain('guardada correctamente');
  });
});
