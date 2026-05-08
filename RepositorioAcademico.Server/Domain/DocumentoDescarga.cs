namespace RepositorioAcademico.Server.Domain
{
    public class DocumentoDescarga
    {
        public int Id { get; set; }

        public int DocumentoId { get; set; }

        public Documento? Documento { get; set; }

        public int UsuarioId { get; set; }

        public Usuario? Usuario { get; set; }

        public DateTime FechaDescarga { get; set; } = DateTime.UtcNow;
    }
}
