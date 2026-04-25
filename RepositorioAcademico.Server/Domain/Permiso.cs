namespace RepositorioAcademico.Server.Domain
{
    public class Permiso
    {
        public int Id { get; set; }

        public string Codigo { get; set; } = string.Empty;

        public string Descripcion { get; set; } = string.Empty;

        public string Estado { get; set; } = "Activo";

        public ICollection<RolPermiso> RolPermisos { get; set; } = [];
    }
}
