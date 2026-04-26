namespace RepositorioAcademico.Server.Contracts
{
    public class DocumentoDto
    {
        public int Id { get; set; }

        public string? Titulo { get; set; }

        public string? Autor { get; set; }

        public int TipoDocumentoId { get; set; }

        public string? TipoDocumento { get; set; }

        public int FacultadId { get; set; }

        public string? Facultad { get; set; }

        public string? RutaDocumento { get; set; }

        public DateTime FechaSubida { get; set; }

        public string? Estado { get; set; }

        public bool SePuedeDescargar { get; set; }

        public int UsuarioId { get; set; }
    }
}
