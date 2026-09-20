namespace RepositorioAcademico.Server.Contracts
{
    public class SublineaInvestigacionDto
    {
        public int Id { get; set; }

        public string Descripcion { get; set; } = string.Empty;

        public string? Estado { get; set; }

        public int LineaInvestigacionId { get; set; }

        public string? LineaInvestigacion { get; set; }
    }
}
