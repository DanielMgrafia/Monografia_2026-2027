import { Component } from '@angular/core';
import { ListaDocumentosComponent } from './components/lista-documentos/lista-documentos.component';
import { SubirDocumentoComponent } from './components/subir-documento/subir-documento.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true,
  imports: [SubirDocumentoComponent, ListaDocumentosComponent],
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'repositorioacademico.client';
}
