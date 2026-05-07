using Microsoft.AspNetCore.Http;

namespace RepositorioAcademico.Server.Contracts
{
    public class SubirDocumentoRequest
    {
        public IFormFile? Archivo { get; set; }

        public string? Titulo { get; set; }

        public string? Autor { get; set; }

        public int TipoDocumentoId { get; set; }

        public int FacultadId { get; set; }

        public bool? SePuedeDescargar { get; set; }
    }
}
