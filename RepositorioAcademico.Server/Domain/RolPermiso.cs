namespace RepositorioAcademico.Server.Domain
{
    public class RolPermiso
    {
        public int RolId { get; set; }

        public Rol? Rol { get; set; }

        public int PermisoId { get; set; }

        public Permiso? Permiso { get; set; }

        public string Estado { get; set; } = "Activo";

        public DateTime FechaAsignacion { get; set; } = DateTime.UtcNow;
    }
}
