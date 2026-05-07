namespace RepositorioAcademico.Server.Domain
{
    public class Usuario
    {
        public int Id { get; set; }

        public string Nombres { get; set; } = string.Empty;

        public string Apellidos { get; set; } = string.Empty;

        public string Correo { get; set; } = string.Empty;

        public string Carnet { get; set; } = string.Empty;

        public string PasswordHash { get; set; } = string.Empty;

        public string Estado { get; set; } = "Activo";

        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

        public ICollection<Documento> Documentos { get; set; } = [];

        public ICollection<UsuarioRol> UsuarioRoles { get; set; } = [];
    }
}
