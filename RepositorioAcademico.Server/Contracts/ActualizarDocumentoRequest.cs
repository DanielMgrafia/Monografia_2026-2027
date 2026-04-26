namespace RepositorioAcademico.Server.Contracts
{
    public class ActualizarDocumentoRequest
    {
        public string? Titulo { get; set; }

        public string? Autor { get; set; }

        public int TipoDocumentoId { get; set; }

        public int FacultadId { get; set; }

        public string? Estado { get; set; }

        public bool SePuedeDescargar { get; set; }
    }
}
