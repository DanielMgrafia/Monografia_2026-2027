namespace RepositorioAcademico.Server.Contracts
{
    public class RolResumenDto
    {
        public int Id { get; set; }

        public string Nombre { get; set; } = string.Empty;

        public string? Descripcion { get; set; }

        public string Estado { get; set; } = string.Empty;
    }
}
