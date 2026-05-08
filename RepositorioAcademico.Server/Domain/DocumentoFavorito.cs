namespace RepositorioAcademico.Server.Domain
{
    public class DocumentoFavorito
    {
        public int Id { get; set; }

        public int DocumentoId { get; set; }

        public Documento? Documento { get; set; }

        public int UsuarioId { get; set; }

        public Usuario? Usuario { get; set; }

        public DateTime FechaMarcado { get; set; } = DateTime.UtcNow;
    }
}
