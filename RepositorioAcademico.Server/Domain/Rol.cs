namespace RepositorioAcademico.Server.Domain
{
    public class Rol
    {
        public int Id { get; set; }

        public string Nombre { get; set; } = string.Empty;

        public string? Descripcion { get; set; }

        public string Estado { get; set; } = "Activo";

        public bool EsEstudiante { get; set; }

        public bool EsDocente { get; set; }

        public bool EsAdministrador { get; set; }

        public bool EsCargoAcademico { get; set; }

        public ICollection<UsuarioRol> UsuarioRoles { get; set; } = [];

        public ICollection<RolPermiso> RolPermisos { get; set; } = [];
    }
}
