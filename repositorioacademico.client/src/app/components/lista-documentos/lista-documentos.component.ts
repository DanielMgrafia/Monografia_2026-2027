import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Documento } from '../../models/documento';
import { DocumentosService } from '../../services/documentos.service';

@Component({
  selector: 'app-lista-documentos',
  templateUrl: './lista-documentos.component.html',
  standalone: true,
  imports: [CommonModule],
  styleUrls: ['./lista-documentos.component.css']
})
export class ListaDocumentosComponent implements OnInit {

  documentos: Documento[] = [];
  private readonly documentosService = inject(DocumentosService);

  ngOnInit(): void {
    this.cargarDocumentos();
  }

  cargarDocumentos(): void {
    this.documentosService.getDocumentos().subscribe({
      next: (data) => {
        this.documentos = data;
      },
      error: (error) => {
        console.error('Error al cargar documentos', error);
      }
    });
  }

  verArchivo(ruta: string | undefined): void {
    if (!ruta) return;

    const url = this.documentosService.getArchivoUrl(ruta);
    window.open(url, '_blank');
  }
}
