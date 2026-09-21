import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject, of } from 'rxjs';
import { Carrera } from '../../models/carrera';
import { Catalogo } from '../../models/catalogo';
import { Usuario } from '../../models/usuario';
import { AuthService } from '../../services/auth.service';
import { CarrerasService } from '../../services/carreras.service';
import { CatalogosService } from '../../services/catalogos.service';
import { DocumentosService } from '../../services/documentos.service';
import { SubirDocumentoComponent } from './subir-documento.component';

describe('SubirDocumentoComponent', () => {
  let component: SubirDocumentoComponent;
  let fixture: ComponentFixture<SubirDocumentoComponent>;
  let catalogosServiceSpy: jasmine.SpyObj<CatalogosService>;
  let carrerasServiceSpy: jasmine.SpyObj<CarrerasService>;
  let documentosServiceSpy: jasmine.SpyObj<DocumentosService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let tipoDocumentoCreado$: Subject<Catalogo>;

  const mockUsuario: Usuario = {
    id: 99,
    nombres: 'Admin',
    apellidos: 'Sistema',
    correo: 'admin@universidad.edu',
    carnet: 'ADMIN-001',
    estado: 'Activo',
    fechaCreacion: new Date().toISOString(),
    roles: [],
    permisos: []
  };

  const mockTiposDocumento: Catalogo[] = [
    { id: 1, descripcion: 'Tesis' }
  ];

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
    tipoDocumentoCreado$ = new Subject<Catalogo>();

    catalogosServiceSpy = jasmine.createSpyObj<CatalogosService>(
      'CatalogosService',
      ['getTiposDocumento', 'crearTipoDocumento', 'getLineasInvestigacion', 'getSublineasInvestigacion'],
      { tipoDocumentoCreado$ }
    );

    carrerasServiceSpy = jasmine.createSpyObj<CarrerasService>(
      'CarrerasService',
      ['getCarreras']
    );

    documentosServiceSpy = jasmine.createSpyObj<DocumentosService>(
      'DocumentosService',
      ['subirDocumento']
    );
    authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', ['currentUser']);

    catalogosServiceSpy.getTiposDocumento.and.returnValue(of(mockTiposDocumento));
    catalogosServiceSpy.getLineasInvestigacion.and.returnValue(of([]));
    catalogosServiceSpy.getSublineasInvestigacion.and.returnValue(of([]));
    carrerasServiceSpy.getCarreras.and.returnValue(of(mockCarreras));
    authServiceSpy.currentUser.and.returnValue(mockUsuario);
    documentosServiceSpy.subirDocumento.and.returnValue(of({
      id: 1,
      titulo: 'Documento',
      autor: 'Autor',
      tipoDocumentoId: 1,
      fechaSubida: new Date(),
      usuarioId: 1
    }));

    await TestBed.configureTestingModule({
      imports: [SubirDocumentoComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: CarrerasService, useValue: carrerasServiceSpy },
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
    expect(carrerasServiceSpy.getCarreras).toHaveBeenCalled();
    expect(component.autor).toBe('Admin Sistema');
    expect(component.sePuedeDescargar).toBeTrue();
    expect(component.tiposDocumento).toEqual(mockTiposDocumento);
    expect(component.carreras).toEqual(mockCarreras);
  });

  it('should refresh document types when a new type is created', () => {
    catalogosServiceSpy.getTiposDocumento.and.returnValue(of([
      ...mockTiposDocumento,
      { id: 3, descripcion: 'Monografia' }
    ]));

    tipoDocumentoCreado$.next({ id: 3, descripcion: 'Monografia' });

    expect(catalogosServiceSpy.getTiposDocumento).toHaveBeenCalledTimes(2);
    expect(component.tiposDocumento).toEqual([
      { id: 1, descripcion: 'Tesis' },
      { id: 3, descripcion: 'Monografia' }
    ]);
    expect(component.tipoDocumentoId).toBe(3);
  });

  it('should clear the form fields after cleanup', () => {
    component.titulo = 'Documento de prueba';
    component.autor = 'Autor Temporal';
    component.tipoDocumentoId = 1;
    component.carreraId = 2;
    component.sePuedeDescargar = false;
    component.archivoSeleccionado = new File(['contenido'], 'demo.pdf', { type: 'application/pdf' });

    component.limpiarFormulario();

    expect(component.titulo).toBe('');
    expect(component.autor).toBe('');
    expect(component.tipoDocumentoId).toBeNull();
    expect(component.carreraId).toBeNull();
    expect(component.sePuedeDescargar).toBeTrue();
    expect(component.archivoSeleccionado).toBeNull();
  });
});
