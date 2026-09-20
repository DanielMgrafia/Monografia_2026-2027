namespace RepositorioAcademico.Server.Domain
{
    public class LineaInvestigacion
    {
        public int Id { get; set; }

        public string Descripcion { get; set; } = string.Empty;

        public string? Estado { get; set; }

        public ICollection<SublineaInvestigacion> SublineasInvestigacion { get; set; } = [];

        public ICollection<CarreraLineaInvestigacion> CarreraLineasInvestigacion { get; set; } = [];
    }
}
