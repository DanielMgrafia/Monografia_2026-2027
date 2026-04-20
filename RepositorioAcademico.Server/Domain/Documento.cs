namespace RepositorioAcademico.Server.Domain
{
    public class Documento
    {
        public int Id { get; set; }

        public string? Titulo { get; set; }

        public string? Autor { get; set; }

        public string? Tipo { get; set; }

        public string? Categoria { get; set; }

        public string? RutaDocumento { get; set; }

        public DateTime FechaSubida { get; set; }

        public string? Estado { get; set; }

        public int UsuarioId { get; set; }
    }
}