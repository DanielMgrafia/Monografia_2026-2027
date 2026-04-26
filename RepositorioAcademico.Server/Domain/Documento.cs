namespace RepositorioAcademico.Server.Domain
{
    public class Documento
    {
        public int Id { get; set; }

        public string? Titulo { get; set; }

        public string? Autor { get; set; }

        public int TipoDocumentoId { get; set; }

        public TipoDocumento? TipoDocumento { get; set; }

        public int FacultadId { get; set; }

        public Facultad? Facultad { get; set; }

        public string? RutaDocumento { get; set; }

        public DateTime FechaSubida { get; set; }

        public string? Estado { get; set; }

        public bool SePuedeDescargar { get; set; } = true;

        public int UsuarioId { get; set; }
    }
}
