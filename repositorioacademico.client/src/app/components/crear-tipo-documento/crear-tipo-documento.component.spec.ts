import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EMPTY, of } from 'rxjs';
import { Catalogo } from '../../models/catalogo';
import { CatalogosService } from '../../services/catalogos.service';
import { CrearTipoDocumentoComponent } from './crear-tipo-documento.component';

describe('CrearTipoDocumentoComponent', () => {
  let component: CrearTipoDocumentoComponent;
  let fixture: ComponentFixture<CrearTipoDocumentoComponent>;
  let catalogosServiceSpy: jasmine.SpyObj<CatalogosService>;

  const mockTiposDocumento: Catalogo[] = [
    { id: 1, descripcion: 'Informe tecnico' },
    { id: 2, descripcion: 'Tesis' }
  ];

  beforeEach(async () => {
    catalogosServiceSpy = jasmine.createSpyObj<CatalogosService>(
      'CatalogosService',
      ['getTiposDocumento', 'crearTipoDocumento'],
      { tipoDocumentoCreado$: EMPTY }
    );

    catalogosServiceSpy.getTiposDocumento.and.returnValue(of(mockTiposDocumento));
    catalogosServiceSpy.crearTipoDocumento.and.returnValue(
      of({ id: 3, descripcion: 'Monografia' })
    );

    await TestBed.configureTestingModule({
      imports: [CrearTipoDocumentoComponent],
      providers: [{ provide: CatalogosService, useValue: catalogosServiceSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(CrearTipoDocumentoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load document types on init', () => {
    expect(catalogosServiceSpy.getTiposDocumento).toHaveBeenCalled();
    expect(component.tiposDocumento).toEqual([
      { id: 1, descripcion: 'Informe tecnico' },
      { id: 2, descripcion: 'Tesis' }
    ]);
  });

  it('should save a new document type and update the list', () => {
    component.descripcion = 'Monografia';

    component.guardarTipoDocumento();

    expect(catalogosServiceSpy.crearTipoDocumento).toHaveBeenCalledWith('Monografia');
    expect(component.tiposDocumento).toEqual([
      { id: 1, descripcion: 'Informe tecnico' },
      { id: 3, descripcion: 'Monografia' },
      { id: 2, descripcion: 'Tesis' }
    ]);
    expect(component.mensaje).toContain('guardado correctamente');
  });
});
