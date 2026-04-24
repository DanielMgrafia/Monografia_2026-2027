import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Documento } from '../../models/documento';
import { DocumentosService } from '../../services/documentos.service';
import { ListaDocumentosComponent } from './lista-documentos.component';

describe('ListaDocumentosComponent', () => {
  let documentosServiceSpy: jasmine.SpyObj<DocumentosService>;

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
      usuarioId: 99
    }
  ];

  beforeEach(async () => {
    documentosServiceSpy = jasmine.createSpyObj<DocumentosService>(
      'DocumentosService',
      ['getDocumentos', 'getArchivoUrl']
    );

    documentosServiceSpy.getDocumentos.and.returnValue(of(mockDocumentos));
    documentosServiceSpy.getArchivoUrl.and.returnValue(
      'https://localhost:7225/api/documentos/archivo/archivo-demo.pdf'
    );

    await TestBed.configureTestingModule({
      imports: [ListaDocumentosComponent],
      providers: [
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

  it('should open the generated file URL in a new tab', () => {
    const fixture = TestBed.createComponent(ListaDocumentosComponent);
    const component = fixture.componentInstance;
    const openSpy = spyOn(window, 'open');

    component.verArchivo('archivo-demo.pdf');

    expect(documentosServiceSpy.getArchivoUrl).toHaveBeenCalledWith('archivo-demo.pdf');
    expect(openSpy).toHaveBeenCalledWith(
      'https://localhost:7225/api/documentos/archivo/archivo-demo.pdf',
      '_blank'
    );
  });
});
