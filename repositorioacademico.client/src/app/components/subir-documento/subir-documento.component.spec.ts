import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Catalogo } from '../../models/catalogo';
import { CatalogosService } from '../../services/catalogos.service';
import { DocumentosService } from '../../services/documentos.service';
import { SubirDocumentoComponent } from './subir-documento.component';

describe('SubirDocumentoComponent', () => {
  let component: SubirDocumentoComponent;
  let fixture: ComponentFixture<SubirDocumentoComponent>;
  let catalogosServiceSpy: jasmine.SpyObj<CatalogosService>;
  let documentosServiceSpy: jasmine.SpyObj<DocumentosService>;

  const mockTiposDocumento: Catalogo[] = [
    { id: 1, descripcion: 'Tesis' }
  ];

  const mockFacultades: Catalogo[] = [
    { id: 2, descripcion: 'Ingenieria' }
  ];

  beforeEach(async () => {
    catalogosServiceSpy = jasmine.createSpyObj<CatalogosService>(
      'CatalogosService',
      ['getTiposDocumento', 'getFacultades']
    );

    documentosServiceSpy = jasmine.createSpyObj<DocumentosService>(
      'DocumentosService',
      ['subirDocumento']
    );

    catalogosServiceSpy.getTiposDocumento.and.returnValue(of(mockTiposDocumento));
    catalogosServiceSpy.getFacultades.and.returnValue(of(mockFacultades));
    documentosServiceSpy.subirDocumento.and.returnValue(of({
      id: 1,
      titulo: 'Documento',
      autor: 'Autor',
      tipoDocumentoId: 1,
      facultadId: 2,
      fechaSubida: new Date(),
      usuarioId: 1
    }));

    await TestBed.configureTestingModule({
      imports: [SubirDocumentoComponent],
      providers: [
        { provide: CatalogosService, useValue: catalogosServiceSpy },
        { provide: DocumentosService, useValue: documentosServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SubirDocumentoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load catalogs on init', () => {
    expect(catalogosServiceSpy.getTiposDocumento).toHaveBeenCalled();
    expect(catalogosServiceSpy.getFacultades).toHaveBeenCalled();
    expect(component.tiposDocumento).toEqual(mockTiposDocumento);
    expect(component.facultades).toEqual(mockFacultades);
  });
});
