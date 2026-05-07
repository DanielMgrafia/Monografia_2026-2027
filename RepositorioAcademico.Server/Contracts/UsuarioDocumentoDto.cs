namespace RepositorioAcademico.Server.Contracts
{
    public class UsuarioDocumentoDto
    {
        public int Id { get; set; }

        public string Nombres { get; set; } = string.Empty;

        public string Apellidos { get; set; } = string.Empty;

        public string Correo { get; set; } = string.Empty;
    }
}
