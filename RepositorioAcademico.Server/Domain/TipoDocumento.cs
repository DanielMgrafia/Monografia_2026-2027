namespace RepositorioAcademico.Server.Domain
{
    public class TipoDocumento
    {
        public int Id { get; set; }

        public string Descripcion { get; set; } = string.Empty;

        public string? Estado { get; set; }

        public ICollection<Documento> Documentos { get; set; } = [];
    }
}
