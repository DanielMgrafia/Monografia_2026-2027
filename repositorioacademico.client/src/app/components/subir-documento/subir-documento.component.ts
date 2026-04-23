import { Component } from '@angular/core';
import { DocumentosService } from '../../services/documentos.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-subir-documento',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './subir-documento.component.html',
  styleUrls: ['./subir-documento.component.css']
})
export class SubirDocumentoComponent {
  titulo: string = '';
  autor: string = '';
  tipo: string = '';
  categoria: string = '';
  archivoSeleccionado: File | null = null;

  cargando: boolean = false;
  mensaje: string = '';
  error: string = '';

  constructor(private documentosService: DocumentosService) { }

  seleccionarArchivo(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const archivo = input.files[0];

      if (
          archivo.type !== 'application/pdf' &&
          archivo.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
         ) {
       
        this.error = 'Solo se permiten archivos PDF y Word.';
        this.archivoSeleccionado = null;
        return;
      }

      this.archivoSeleccionado = archivo;
      this.error = '';
    }
  }

  guardarDocumento(): void {
    this.mensaje = '';
    this.error = '';

    if (!this.titulo || !this.autor || !this.tipo || !this.categoria) {
      this.error = 'Completa todos los campos.';
      return;
    }

    if (!this.archivoSeleccionado) {
      this.error = 'Debes seleccionar un archivo.';
      return;
    }

    const formData = new FormData();
    formData.append('archivo', this.archivoSeleccionado);
    formData.append('titulo', this.titulo);
    formData.append('autor', this.autor);
    formData.append('tipo', this.tipo);
    formData.append('categoria', this.categoria);
    formData.append('usuarioId', '1');

    this.cargando = true;

    this.documentosService.subirDocumento(formData).subscribe({
      next: () => {
        this.mensaje = 'Documento subido correctamente.';
        this.limpiarFormulario();
        this.cargando = false;
      },
      error: () => {
        this.error = 'Ocurrió un error al subir el documento.';
        this.cargando = false;
      }
    });
  }

  limpiarFormulario(): void {
    this.titulo = '';
    this.autor = '';
    this.tipo = '';
    this.categoria = '';
    this.archivoSeleccionado = null;
  }
}
