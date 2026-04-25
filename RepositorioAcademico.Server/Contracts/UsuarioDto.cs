namespace RepositorioAcademico.Server.Contracts
{
    public class UsuarioDto
    {
        public int Id { get; set; }

        public string Nombres { get; set; } = string.Empty;

        public string Apellidos { get; set; } = string.Empty;

        public string Correo { get; set; } = string.Empty;

        public string Carnet { get; set; } = string.Empty;

        public string Estado { get; set; } = string.Empty;

        public DateTime FechaCreacion { get; set; }

        public List<RolResumenDto> Roles { get; set; } = [];

        public List<string> Permisos { get; set; } = [];
    }
}
