import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject, of } from 'rxjs';
import { Catalogo } from '../../models/catalogo';
import { Usuario } from '../../models/usuario';
import { AuthService } from '../../services/auth.service';
import { CatalogosService } from '../../services/catalogos.service';
import { DocumentosService } from '../../services/documentos.service';
import { SubirDocumentoComponent } from './subir-documento.component';

describe('SubirDocumentoComponent', () => {
  let component: SubirDocumentoComponent;
  let fixture: ComponentFixture<SubirDocumentoComponent>;
  let catalogosServiceSpy: jasmine.SpyObj<CatalogosService>;
  let documentosServiceSpy: jasmine.SpyObj<DocumentosService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let tipoDocumentoCreado$: Subject<Catalogo>;
  let facultadCreada$: Subject<Catalogo>;

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

  const mockFacultades: Catalogo[] = [
    { id: 2, descripcion: 'Ingenieria' }
  ];

  beforeEach(async () => {
    tipoDocumentoCreado$ = new Subject<Catalogo>();
    facultadCreada$ = new Subject<Catalogo>();

    catalogosServiceSpy = jasmine.createSpyObj<CatalogosService>(
      'CatalogosService',
      ['getTiposDocumento', 'getFacultades', 'crearFacultad', 'crearTipoDocumento'],
      { tipoDocumentoCreado$, facultadCreada$ }
    );

    documentosServiceSpy = jasmine.createSpyObj<DocumentosService>(
      'DocumentosService',
      ['subirDocumento']
    );
    authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', ['currentUser']);

    catalogosServiceSpy.getTiposDocumento.and.returnValue(of(mockTiposDocumento));
    catalogosServiceSpy.getFacultades.and.returnValue(of(mockFacultades));
    authServiceSpy.currentUser.and.returnValue(mockUsuario);
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
        { provide: AuthService, useValue: authServiceSpy },
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
    expect(component.autor).toBe('Admin Sistema');
    expect(component.sePuedeDescargar).toBeTrue();
    expect(component.tiposDocumento).toEqual(mockTiposDocumento);
    expect(component.facultades).toEqual(mockFacultades);
  });

  it('should refresh faculties when a new faculty is created', () => {
    catalogosServiceSpy.getFacultades.and.returnValue(of([
      ...mockFacultades,
      { id: 3, descripcion: 'Medicina' }
    ]));

    facultadCreada$.next({ id: 3, descripcion: 'Medicina' });

    expect(catalogosServiceSpy.getFacultades).toHaveBeenCalledTimes(2);
    expect(component.facultades).toEqual([
      { id: 2, descripcion: 'Ingenieria' },
      { id: 3, descripcion: 'Medicina' }
    ]);
    expect(component.facultadId).toBe(3);
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
    component.facultadId = 2;
    component.sePuedeDescargar = false;
    component.archivoSeleccionado = new File(['contenido'], 'demo.pdf', { type: 'application/pdf' });

    component.limpiarFormulario();

    expect(component.titulo).toBe('');
    expect(component.autor).toBe('');
    expect(component.tipoDocumentoId).toBeNull();
    expect(component.facultadId).toBeNull();
    expect(component.sePuedeDescargar).toBeTrue();
    expect(component.archivoSeleccionado).toBeNull();
  });
});
