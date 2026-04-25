namespace RepositorioAcademico.Server.Domain
{
    public class UsuarioRol
    {
        public int UsuarioId { get; set; }

        public Usuario? Usuario { get; set; }

        public int RolId { get; set; }

        public Rol? Rol { get; set; }

        public string Estado { get; set; } = "Activo";

        public DateTime FechaAsignacion { get; set; } = DateTime.UtcNow;
    }
}
