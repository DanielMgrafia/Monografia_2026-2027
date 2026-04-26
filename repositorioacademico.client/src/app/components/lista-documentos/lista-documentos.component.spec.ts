import { TestBed } from '@angular/core/testing';
import { convertToParamMap, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { Documento } from '../../models/documento';
import { AuthService } from '../../services/auth.service';
import { DocumentosService } from '../../services/documentos.service';
import { ListaDocumentosComponent } from './lista-documentos.component';

describe('ListaDocumentosComponent', () => {
  let documentosServiceSpy: jasmine.SpyObj<DocumentosService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  const mockDocumentos: Documento[] = [
    {
      id: 1,
      titulo: 'Documento de prueba',
      autor: 'Autor Demo',
      tipoDocumentoId: 1,
      tipoDocumento: 'Tesis',
      facultadId: 2,
      facultad: 'Ingenieria',
      rutaDocumento: 'archivo-demo.pdf',
      fechaSubida: new Date('2026-01-15'),
      estado: 'Aprobado',
      sePuedeDescargar: true,
      usuarioId: 99
    }
  ];

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', ['hasPermission']);
    documentosServiceSpy = jasmine.createSpyObj<DocumentosService>(
      'DocumentosService',
      ['getDocumentos']
    );

    documentosServiceSpy.getDocumentos.and.returnValue(of(mockDocumentos));
    authServiceSpy.hasPermission.and.returnValue(true);

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
        { provide: DocumentosService, useValue: documentosServiceSpy }
      ]
    }).compileComponents();
  });

  it('should load documents on init', () => {
    const fixture = TestBed.createComponent(ListaDocumentosComponent);
    const component = fixture.componentInstance;

    fixture.detectChanges();

    expect(documentosServiceSpy.getDocumentos).toHaveBeenCalled();
    expect(component.documentos).toEqual(mockDocumentos);
  });

  it('should select the document to open the viewer modal', () => {
    const fixture = TestBed.createComponent(ListaDocumentosComponent);
    const component = fixture.componentInstance;

    component.abrirVisor(mockDocumentos[0]);

    expect(component.documentoSeleccionado).toEqual(mockDocumentos[0]);
  });
});
