namespace RepositorioAcademico.Server.Contracts
{
    public class PermisoDto
    {
        public int Id { get; set; }

        public string Codigo { get; set; } = string.Empty;

        public string Descripcion { get; set; } = string.Empty;

        public string Estado { get; set; } = string.Empty;
    }
}
