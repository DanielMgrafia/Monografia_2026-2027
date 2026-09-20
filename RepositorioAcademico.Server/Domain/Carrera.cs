namespace RepositorioAcademico.Server.Domain
{
    public class Carrera
    {
        public int Id { get; set; }

        public int FacultadId { get; set; }

        public Facultad? Facultad { get; set; }

        public int AreaConocimientoId { get; set; }

        public AreaConocimiento? AreaConocimiento { get; set; }

        public string Descripcion { get; set; } = string.Empty;

        public string? Estado { get; set; }

        public ICollection<CarreraLineaInvestigacion> CarreraLineasInvestigacion { get; set; } = [];
    }
}
