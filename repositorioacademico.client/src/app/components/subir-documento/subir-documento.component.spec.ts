import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { SubirDocumentoComponent } from './subir-documento.component';

describe('SubirDocumentoComponent', () => {
  let component: SubirDocumentoComponent;
  let fixture: ComponentFixture<SubirDocumentoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubirDocumentoComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubirDocumentoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
