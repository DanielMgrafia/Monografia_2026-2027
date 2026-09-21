import { TestBed } from '@angular/core/testing';
import { convertToParamMap, ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { Carrera } from '../../models/carrera';
import { Catalogo } from '../../models/catalogo';
import { Documento } from '../../models/documento';
import { AuthService } from '../../services/auth.service';
import { BibliotecaService } from '../../services/biblioteca.service';
import { CarrerasService } from '../../services/carreras.service';
import { CatalogosService } from '../../services/catalogos.service';
import { DocumentosService } from '../../services/documentos.service';
import { ListaDocumentosComponent } from './lista-documentos.component';

describe('ListaDocumentosComponent', () => {
  let documentosServiceSpy: jasmine.SpyObj<DocumentosService>;
  let catalogosServiceSpy: jasmine.SpyObj<CatalogosService>;
  let carrerasServiceSpy: jasmine.SpyObj<CarrerasService>;
  let bibliotecaServiceSpy: jasmine.SpyObj<BibliotecaService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockDocumentos: Documento[] = [
    {
      id: 1,
      titulo: 'Documento de prueba',
      autor: 'Autor Demo',
      tipoDocumentoId: 1,
      tipoDocumento: 'Tesis',
      carreraId: 2,
      carrera: 'Ingenieria en Sistemas',
      rutaDocumento: 'archivo-demo.pdf',
      fechaSubida: new Date('2026-01-15'),
      estado: 'Publicado',
      sePuedeDescargar: true,
      usuarioId: 99
    }
  ];
  const mockCatalogos: Catalogo[] = [{ id: 1, descripcion: 'Tesis' }];
  const mockCarreras: Carrera[] = [
    {
      id: 2,
      descripcion: 'Ingenieria en Sistemas',
      areaConocimientoId: 1,
      areaConocimiento: 'Tecnologia',
      lineasInvestigacion: []
    }
  ];

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', ['hasPermission']);
    routerSpy = jasmine.createSpyObj<Router>('Router', ['createUrlTree', 'serializeUrl']);
    catalogosServiceSpy = jasmine.createSpyObj<CatalogosService>('CatalogosService', [
      'getTiposDocumento',
      'getAreasConocimiento',
      'getLineasInvestigacion',
      'getSublineasInvestigacion'
    ]);
    carrerasServiceSpy = jasmine.createSpyObj<CarrerasService>('CarrerasService', [
      'getCarreras'
    ]);
    bibliotecaServiceSpy = jasmine.createSpyObj<BibliotecaService>('BibliotecaService', [
      'getRecomendaciones',
      'alternarFavorito'
    ]);
    documentosServiceSpy = jasmine.createSpyObj<DocumentosService>(
      'DocumentosService',
      ['getDocumentos']
    );

    documentosServiceSpy.getDocumentos.and.returnValue(of(mockDocumentos));
    bibliotecaServiceSpy.getRecomendaciones.and.returnValue(of([]));
    catalogosServiceSpy.getTiposDocumento.and.returnValue(of(mockCatalogos));
    catalogosServiceSpy.getAreasConocimiento.and.returnValue(of([]));
    catalogosServiceSpy.getLineasInvestigacion.and.returnValue(of([]));
    catalogosServiceSpy.getSublineasInvestigacion.and.returnValue(of([]));
    carrerasServiceSpy.getCarreras.and.returnValue(of(mockCarreras));
    authServiceSpy.hasPermission.and.returnValue(true);
    routerSpy.createUrlTree.and.returnValue({} as never);
    routerSpy.serializeUrl.and.returnValue('/visor-documento/1');

    await TestBed.configureTestingModule({
      imports: [ListaDocumentosComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: of(convertToParamMap({}))
          }
        },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: BibliotecaService, useValue: bibliotecaServiceSpy },
        { provide: CarrerasService, useValue: carrerasServiceSpy },
        { provide: CatalogosService, useValue: catalogosServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: DocumentosService, useValue: documentosServiceSpy }
      ]
    }).compileComponents();
  });

  it('should load documents on init', () => {
    const fixture = TestBed.createComponent(ListaDocumentosComponent);
    const component = fixture.componentInstance;

    fixture.detectChanges();

    expect(documentosServiceSpy.getDocumentos).toHaveBeenCalled();
    expect(catalogosServiceSpy.getTiposDocumento).toHaveBeenCalled();
    expect(carrerasServiceSpy.getCarreras).toHaveBeenCalled();
    expect(component.documentos).toEqual(mockDocumentos);
  });

  it('should open the viewer in a new tab', () => {
    const fixture = TestBed.createComponent(ListaDocumentosComponent);
    const component = fixture.componentInstance;
    const openSpy = spyOn(window, 'open');

    component.abrirVisor(mockDocumentos[0]);

    expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/visor-documento', 1]);
    expect(routerSpy.serializeUrl).toHaveBeenCalled();
    expect(openSpy).toHaveBeenCalledWith('/visor-documento/1', '_blank');
  });
});
