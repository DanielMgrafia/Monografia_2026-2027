namespace RepositorioAcademico.Server.Domain
{
    public class SublineaInvestigacion
    {
        public int Id { get; set; }

        public int LineaInvestigacionId { get; set; }

        public LineaInvestigacion? LineaInvestigacion { get; set; }

        public string Descripcion { get; set; } = string.Empty;

        public string? Estado { get; set; }
    }
}
