namespace RepositorioAcademico.Server.Domain
{
    public class CarreraLineaInvestigacion
    {
        public int CarreraId { get; set; }

        public Carrera? Carrera { get; set; }

        public int LineaInvestigacionId { get; set; }

        public LineaInvestigacion? LineaInvestigacion { get; set; }

        public string Estado { get; set; } = "Activo";

        public DateTime FechaAsignacion { get; set; } = DateTime.UtcNow;
    }
}
