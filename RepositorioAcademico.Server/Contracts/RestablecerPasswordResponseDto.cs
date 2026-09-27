namespace RepositorioAcademico.Server.Contracts
{
    public class RestablecerPasswordResponseDto
    {
        public string PasswordTemporal { get; set; } = string.Empty;

        public DateTime ExpiraEn { get; set; }

        public UsuarioDto Usuario { get; set; } = new();
    }
}
