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

        public string? Tutor { get; set; }

        public int? AnioPublicacion { get; set; }

        public string? Descripcion { get; set; }

        public string? PalabrasClave { get; set; }

        public DateTime FechaSubida { get; set; }

        public string? Estado { get; set; }

        public bool SePuedeDescargar { get; set; }

        public int UsuarioId { get; set; }

        public UsuarioDocumentoDto? Usuario { get; set; }

        public bool EsFavorito { get; set; }
    }
}
