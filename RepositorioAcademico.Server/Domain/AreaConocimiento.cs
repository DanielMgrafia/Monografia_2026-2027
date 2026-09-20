namespace RepositorioAcademico.Server.Domain
{
    public class AreaConocimiento
    {
        public int Id { get; set; }

        public string Descripcion { get; set; } = string.Empty;

        public string? Estado { get; set; }

        public ICollection<Carrera> Carreras { get; set; } = [];
    }
}
