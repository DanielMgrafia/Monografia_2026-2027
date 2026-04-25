namespace RepositorioAcademico.Server.Contracts
{
    public class RolDto
    {
        public int Id { get; set; }

        public string Nombre { get; set; } = string.Empty;

        public string? Descripcion { get; set; }

        public string Estado { get; set; } = string.Empty;

        public List<PermisoDto> Permisos { get; set; } = [];
    }
}
