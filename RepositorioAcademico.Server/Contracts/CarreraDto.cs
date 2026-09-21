namespace RepositorioAcademico.Server.Contracts
{
    public class CarreraDto
    {
        public int Id { get; set; }

        public string Descripcion { get; set; } = string.Empty;

        public string? Estado { get; set; }

        public int AreaConocimientoId { get; set; }

        public string? AreaConocimiento { get; set; }

        public List<CatalogoDto> LineasInvestigacion { get; set; } = [];
    }
}
