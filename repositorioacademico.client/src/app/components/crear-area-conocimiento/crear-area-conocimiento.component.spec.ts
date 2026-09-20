import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EMPTY, of } from 'rxjs';
import { Catalogo } from '../../models/catalogo';
import { CatalogosService } from '../../services/catalogos.service';
import { CrearAreaConocimientoComponent } from './crear-area-conocimiento.component';

describe('CrearAreaConocimientoComponent', () => {
  let component: CrearAreaConocimientoComponent;
  let fixture: ComponentFixture<CrearAreaConocimientoComponent>;
  let catalogosServiceSpy: jasmine.SpyObj<CatalogosService>;

  const mockAreasConocimiento: Catalogo[] = [
    { id: 1, descripcion: 'Ciencias de la computacion' },
    { id: 2, descripcion: 'Educacion' }
  ];

  beforeEach(async () => {
    catalogosServiceSpy = jasmine.createSpyObj<CatalogosService>(
      'CatalogosService',
      ['getAreasConocimiento', 'crearAreaConocimiento'],
      { areaConocimientoCreada$: EMPTY }
    );

    catalogosServiceSpy.getAreasConocimiento.and.returnValue(of(mockAreasConocimiento));
    catalogosServiceSpy.crearAreaConocimiento.and.returnValue(
      of({ id: 3, descripcion: 'Salud publica' })
    );

    await TestBed.configureTestingModule({
      imports: [CrearAreaConocimientoComponent],
      providers: [{ provide: CatalogosService, useValue: catalogosServiceSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(CrearAreaConocimientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load knowledge areas on init', () => {
    expect(catalogosServiceSpy.getAreasConocimiento).toHaveBeenCalled();
    expect(component.areasConocimiento).toEqual([
      { id: 1, descripcion: 'Ciencias de la computacion' },
      { id: 2, descripcion: 'Educacion' }
    ]);
  });

  it('should save a new knowledge area and update the list', () => {
    component.descripcion = 'Salud publica';

    component.guardarAreaConocimiento();

    expect(catalogosServiceSpy.crearAreaConocimiento).toHaveBeenCalledWith('Salud publica');
    expect(component.areasConocimiento).toEqual([
      { id: 1, descripcion: 'Ciencias de la computacion' },
      { id: 2, descripcion: 'Educacion' },
      { id: 3, descripcion: 'Salud publica' }
    ]);
    expect(component.mensaje).toContain('guardada correctamente');
  });
});
