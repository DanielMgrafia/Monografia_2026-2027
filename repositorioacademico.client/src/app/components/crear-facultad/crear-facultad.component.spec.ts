import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EMPTY, of } from 'rxjs';
import { Catalogo } from '../../models/catalogo';
import { CatalogosService } from '../../services/catalogos.service';
import { CrearFacultadComponent } from './crear-facultad.component';

describe('CrearFacultadComponent', () => {
  let component: CrearFacultadComponent;
  let fixture: ComponentFixture<CrearFacultadComponent>;
  let catalogosServiceSpy: jasmine.SpyObj<CatalogosService>;

  const mockFacultades: Catalogo[] = [
    { id: 1, descripcion: 'Derecho' },
    { id: 2, descripcion: 'Ingenieria' }
  ];

  beforeEach(async () => {
    catalogosServiceSpy = jasmine.createSpyObj<CatalogosService>(
      'CatalogosService',
      ['getFacultades', 'crearFacultad'],
      { facultadCreada$: EMPTY }
    );

    catalogosServiceSpy.getFacultades.and.returnValue(of(mockFacultades));
    catalogosServiceSpy.crearFacultad.and.returnValue(
      of({ id: 3, descripcion: 'Medicina' })
    );

    await TestBed.configureTestingModule({
      imports: [CrearFacultadComponent],
      providers: [{ provide: CatalogosService, useValue: catalogosServiceSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(CrearFacultadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load faculties on init', () => {
    expect(catalogosServiceSpy.getFacultades).toHaveBeenCalled();
    expect(component.facultades).toEqual([
      { id: 1, descripcion: 'Derecho' },
      { id: 2, descripcion: 'Ingenieria' }
    ]);
  });

  it('should save a new faculty and update the list', () => {
    component.descripcion = 'Medicina';

    component.guardarFacultad();

    expect(catalogosServiceSpy.crearFacultad).toHaveBeenCalledWith('Medicina');
    expect(component.facultades).toEqual([
      { id: 1, descripcion: 'Derecho' },
      { id: 2, descripcion: 'Ingenieria' },
      { id: 3, descripcion: 'Medicina' }
    ]);
    expect(component.mensaje).toContain('guardada correctamente');
  });
});
