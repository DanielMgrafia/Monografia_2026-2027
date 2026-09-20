import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Catalogo } from '../../models/catalogo';
import { SublineaInvestigacion } from '../../models/sublinea-investigacion';
import { CatalogosService } from '../../services/catalogos.service';
import { CrearSublineaInvestigacionComponent } from './crear-sublinea-investigacion.component';

describe('CrearSublineaInvestigacionComponent', () => {
  let component: CrearSublineaInvestigacionComponent;
  let fixture: ComponentFixture<CrearSublineaInvestigacionComponent>;
  let catalogosServiceSpy: jasmine.SpyObj<CatalogosService>;

  const mockLineasInvestigacion: Catalogo[] = [
    { id: 1, descripcion: 'Inteligencia artificial aplicada' }
  ];

  const mockSublineasInvestigacion: SublineaInvestigacion[] = [
    {
      id: 1,
      descripcion: 'Aprendizaje automatico',
      lineaInvestigacionId: 1,
      lineaInvestigacion: 'Inteligencia artificial aplicada'
    }
  ];

  beforeEach(async () => {
    catalogosServiceSpy = jasmine.createSpyObj<CatalogosService>(
      'CatalogosService',
      ['getLineasInvestigacion', 'getSublineasInvestigacion', 'crearSublineaInvestigacion']
    );

    catalogosServiceSpy.getLineasInvestigacion.and.returnValue(of(mockLineasInvestigacion));
    catalogosServiceSpy.getSublineasInvestigacion.and.returnValue(of(mockSublineasInvestigacion));
    catalogosServiceSpy.crearSublineaInvestigacion.and.returnValue(
      of({
        id: 2,
        descripcion: 'Mineria de datos',
        lineaInvestigacionId: 1,
        lineaInvestigacion: 'Inteligencia artificial aplicada'
      })
    );

    await TestBed.configureTestingModule({
      imports: [CrearSublineaInvestigacionComponent],
      providers: [{ provide: CatalogosService, useValue: catalogosServiceSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(CrearSublineaInvestigacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load research lines and sublines on init', () => {
    expect(catalogosServiceSpy.getLineasInvestigacion).toHaveBeenCalled();
    expect(catalogosServiceSpy.getSublineasInvestigacion).toHaveBeenCalled();
    expect(component.lineasInvestigacion).toEqual(mockLineasInvestigacion);
    expect(component.sublineasInvestigacion).toEqual(mockSublineasInvestigacion);
  });

  it('should save a new subline and update the list', () => {
    component.descripcion = 'Mineria de datos';
    component.lineaInvestigacionId = 1;

    component.guardarSublineaInvestigacion();

    expect(catalogosServiceSpy.crearSublineaInvestigacion).toHaveBeenCalledWith({
      descripcion: 'Mineria de datos',
      lineaInvestigacionId: 1
    });
    expect(component.sublineasInvestigacion.map((sublinea) => sublinea.descripcion)).toEqual([
      'Aprendizaje automatico',
      'Mineria de datos'
    ]);
    expect(component.mensaje).toContain('guardada correctamente');
  });
});
